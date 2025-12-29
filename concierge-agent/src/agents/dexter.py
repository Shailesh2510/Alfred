import time
from utils.logger import logger
from models.states import UserState
from langchain_core.messages import AIMessage, ToolMessage
from utils.slack_client import send_to_slack

def dexter(user_state: UserState):
    session_id = user_state["session_id"]
    logger.debug(f'State messages: {user_state["messages"]}')
    validation_id = f"{session_id}_{int(time.time())}"
    
    latest_message = None
    for message in reversed(user_state["messages"]):
        if isinstance(message, AIMessage) and message.content:
            latest_message = message.content
            break
        elif isinstance(message, ToolMessage) and not latest_message:
            latest_message = message.content
            break
    if latest_message is None:
        logger.debug("No suitable message found to send to Slack.")
        latest_message = "No response generated. Please check the request."
    
    try:
        send_to_slack(
            message=latest_message,
            session_id=session_id,
            validation_id=validation_id,
            user_state=user_state,
        )
    except Exception as e:
        error_msg = f"Error sending message to Slack: {str(e)}"
        logger.error(error_msg)
        user_state["messages"].append(AIMessage(content=error_msg, name="System"))
    
    return user_state