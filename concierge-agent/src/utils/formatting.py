from pprint import pprint


def format_conversation(messages):
    formatted_output = []
    for i, msg in enumerate(messages):
        msg_type = msg.__class__.__name__
        formatted_msg = ""
        formatted_msg += f"\nMessage {i+1} ({msg_type})"
        formatted_msg += f"\n{'='*50}"
        formatted_msg += (
            f"\nRole: {getattr(msg, 'role', getattr(msg, 'name', 'Unknown'))}"
        )
        formatted_msg += f"\nID: {getattr(msg, 'id', 'No ID')}"
        if hasattr(msg, "tool_call_id"):
            formatted_msg += f"\nTool Call ID: {msg.tool_call_id}"
        formatted_msg += f"\nContent: {msg.content}"

        # Add tool calls if present
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            formatted_msg += "\n\nTool Calls:"
            for tool_call in msg.tool_calls:
                formatted_msg += f"\n  - Name: {tool_call['name']}"
                formatted_msg += f"\n    ID: {tool_call.get('id', 'No ID')}"
                if "args" in tool_call and tool_call["args"]:
                    formatted_msg += f"\n    Arguments: {tool_call['args']}"

        # Add additional metadata if present
        if hasattr(msg, "additional_kwargs") and msg.additional_kwargs:
            formatted_msg += "\n\nAdditional Info:"
            for key, value in msg.additional_kwargs.items():
                formatted_msg += f"\n  - {key}: {value}"

        # Add usage metadata if present
        if hasattr(msg, "usage_metadata") and msg.usage_metadata:
            formatted_msg += "\n\nUsage Metadata:"
            for key, value in msg.usage_metadata.items():
                formatted_msg += f"\n  - {key}: {value}"

        formatted_output.append(formatted_msg)

    return "\n".join(formatted_output)
