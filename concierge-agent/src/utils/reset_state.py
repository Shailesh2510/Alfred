from models.states import UserState
from utils.logger import logger


def reset_user_state(user_state: UserState = None) -> None:
    """
    Reset the user state to its initial value.
    """
    user_state['quote'] = {}
    user_state['hotel'] = {}
    user_state['search_results'] = {}
    user_state['selected_ride_type'] = ""
    # user_state['agent_output'] = ""
    user_state['flight_number'] = ""
    user_state['is_pickup_from_airport'] = False
    logger.info("User state has been reset to initial values.")