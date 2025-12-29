from datetime import datetime
from utils.logger import logger

def format_datetime(date_str: str, time_str: str) -> str:
    """
    Convert date and time to the required 12-hour format with AM/PM.
    
    Args:
        date_str (str): Date in MM/DD/YYYY format
        time_str (str): Time in HH:mm format
    
    Returns:
        str: Formatted datetime string in "MM/DD/YYYY hh:mm AM/PM" format
    """
    try:
        # Parse the input date and time
        datetime_obj = datetime.strptime(f"{date_str} {time_str}", "%m/%d/%Y %H:%M")
        return datetime_obj.strftime("%m/%d/%Y %I:%M %p")
    except ValueError as e:
        logger.error(f"Error formatting datetime: {str(e)}")
        return ""
