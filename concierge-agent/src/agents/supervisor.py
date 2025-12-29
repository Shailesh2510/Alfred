from models.states import UserState
from utils.llm import llm
from constants.prompts import SUPERVISOR_PROMPT
from utils.logger import logger


def supervisor(user_state: UserState):
    prompt = SUPERVISOR_PROMPT.format(user_input=user_state["user_input"])
    response = llm.invoke([{"role": "user", "content": prompt}] + user_state["messages"])
    decision = response.content.strip().lower()
    logger.info(f"Supervisor Decision: {decision}")
    user_state["agent_output"] = decision
    user_state["messages"] = [response]
    return user_state
