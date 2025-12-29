from models.states import UserState
from utils.llm import llm
from constants.prompts import PIETRO_PROMPT
from tools.hotel_tools import get_hotel_details

def pietro(user_state: UserState):
    llm_with_tools = llm.bind_tools([get_hotel_details])

    guest_metadata = user_state.get("guest_metadata", {})
    web_code = (
        user_state.get("hotel", {}).get("web_code") 
        or guest_metadata.get("hotelWebCode") 
    )

    prompt = PIETRO_PROMPT.format(
        user_input=user_state["user_input"],
        web_code=web_code,
    )

    response = llm_with_tools.invoke(
        [{"role": "user", "content": prompt}] + user_state["messages"]
    )
    
    user_state["agent_output"] = response.content
    user_state["messages"].append(response)
    
    return user_state