from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, SystemMessage
from constants.prompts import SUMMARY_PROMPT
from models.states import UserState
from utils.llm import llm
from utils.logger import logger

def extract_messages(user_state: UserState, max_recent_messages: int = 10, strip_last_n: int = 0):
    """
    Extract messages from user state, keeping recent messages in conversational format
    (excluding ToolMessages) and summarizing older messages.
    
    Args:
        user_state: The user state containing messages
        max_recent_messages: Number of recent messages to keep in conversational format
        strip_last_n: Number of messages to strip from the end
        
    Returns:
        List of formatted messages
    """
    messages = user_state.get("messages", [])

    messages = [
        msg for msg in messages
        if not isinstance(msg, ToolMessage) and getattr(msg, "content", "").strip()
    ]

    if strip_last_n > 0:
        messages = messages[:-strip_last_n] if len(messages) > strip_last_n else []

    if len(messages) <= max_recent_messages:
        logger.debug(f'The messages (no summary needed): {messages}')
        return messages

    recent_messages = messages[-max_recent_messages:]
    older_messages = messages[:-max_recent_messages]

    formatted_messages = []
    if older_messages:
        older_content = format_messages_for_summary(older_messages)
        summary = summarize_messages(older_content)
        summary_format = (
            "*Customer-Agent Interaction Summary:*\n"
            f"{summary}"
        )
        formatted_messages.append(SystemMessage(content=summary_format))

    formatted_messages.extend(recent_messages)

    logger.debug(f'The messages: {formatted_messages}')
    return formatted_messages

def format_messages_for_summary(messages):
    """Format messages for summarization."""
    formatted = []
    for msg in messages:
        content = msg.content
        if isinstance(content, list):
            content = " ".join(str(item) for item in content if isinstance(item, (str, int, float)))
        elif not isinstance(content, str):
            content = ""
        content = content.strip()
        if content:
            role = "user" if isinstance(msg, HumanMessage) else "assistant"
            formatted.append({"role": role, "content": content})
    return formatted

def summarize_messages(messages):
    """Summarize older messages using LLM."""
    message_text = ""
    for msg in messages:
        role = "User" if msg["role"] == "user" else "Assistant"
        message_text += f"{role}: {msg['content']}\n\n"
    
    formatted_prompt = SUMMARY_PROMPT.format(messages=message_text)
    response = llm.invoke([{"role": "user", "content": formatted_prompt}])
    return response.content

def convert_messages_to_string(messages):
    return "\n".join([
        f"{'User' if isinstance(msg, HumanMessage) else 'Assistant' if isinstance(msg, AIMessage) else 'System'}: {msg.content}"
        for msg in messages
    ])
