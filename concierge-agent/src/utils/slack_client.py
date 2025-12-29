import requests
from constants.prompts import DEXTER_PROMPT
from config.settings import settings
from models.states import UserState
from utils.extract_messages import convert_messages_to_string, extract_messages
from utils.logger import logger
from utils.llm import llm

def send_to_slack(message: str, session_id: str, validation_id: str = None, user_state: UserState = None) -> None:
    """Send a message to Slack for human validation via HTTP."""
    formatted_messages = extract_messages(user_state, strip_last_n=1)
    logger.debug(f"Session {session_id} - Sending message to Slack: {user_state}")
    prompt = DEXTER_PROMPT.format(user_input=convert_messages_to_string(formatted_messages))
    summarized_messages = llm.invoke(prompt)
    guest_metadata = user_state.get("guest_metadata", {})
    try:
        payload = {
            "channel": settings.SLACK_CHANNEL_ID,
            "text": message,
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Guest Name:* {guest_metadata.get("name", {})}\n*Contact Number:* {session_id}\n*Hotel Name:* {guest_metadata.get("hotelName", {})}\n*Hotel Web Code:* {guest_metadata.get("hotelWebCode", {})}\n*Check-in Date:* {guest_metadata.get("checkInDate", {})}\n\n\n{summarized_messages.content}"
                    },
                },
                {"type": "divider"},
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"```{message}```"},
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "action_id": "approve_action",
                            "text": {"type": "plain_text", "text": "Approve"},
                            "style": "primary",
                            "value": f"approve:{session_id}:{validation_id or 'none'}",
                        },
                        {
                            "type": "button",
                            "action_id": "modify_action",
                            "text": {"type": "plain_text", "text": "Modify"},
                            "value": f"modify:{session_id}:{validation_id or 'none'}",
                        },
                        {
                            "type": "button",
                            "action_id": "reject_action",
                            "text": {"type": "plain_text", "text": "Reject"},
                            "style": "danger",
                            "value": f"reject:{session_id}:{validation_id or 'none'}",
                        },
                    ],
                },
            ],
        }

        slack_api_url = "https://slack.com/api/chat.postMessage"
        headers = {
            "Authorization": f"Bearer {settings.SLACK_BOT_TOKEN}",
            "Content-Type": "application/json",
        }

        response = requests.post(slack_api_url, json=payload, headers=headers)
        response_data = response.json()

        if response_data.get("ok"):
            logger.info(f"Session {session_id} - Message sent to Slack successfully")
        else:
            logger.error(f"Session {session_id} - Slack API error: {response_data.get('error', 'Unknown error')}")
    except Exception as e:
        logger.error(f"Session {session_id} - Error sending message to Slack: {str(e)}")
        raise