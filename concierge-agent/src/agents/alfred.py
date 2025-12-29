from models.states import UserState
from utils.llm import llm
from constants.prompts import ALFRED_PROMPT
from tools.web_search_tool import web_search
from utils.logger import logger

def alfred(user_state: UserState):
    llm_with_tools = llm.bind_tools([web_search])
    prompt = ALFRED_PROMPT.format(
        message=user_state["messages"],
        search_results=user_state["search_results"] if "search_results" in user_state else ''
    )
    response = llm_with_tools.invoke(prompt)
    user_state["agent_output"] = response.content
    user_state["messages"] = [response]
    return user_state