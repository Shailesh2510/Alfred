from datetime import datetime
import json
from models.states import UserState, HotelState
from tools.book_ride import book_ride
from utils.llm import llm
from constants.prompts import RYDER_PROMPT
from tools.hotel_tools import get_hotel_details
from tools.ride_tools import get_rides_quote
from utils.logger import logger


def ryder(user_state: UserState):
    llm_with_tools = llm.bind_tools([get_hotel_details, get_rides_quote, book_ride])

    guest_metadata = user_state.get("guest_metadata", {})
    airport_code = user_state.get("airport_code", "")
    
    web_code = (
        user_state.get("hotel", {}).get("web_code") 
        or guest_metadata.get("hotelWebCode") 
        or ""
    )
    
    hotel_state = HotelState(user_state.get("hotel", {}))
    
    quote = user_state.get("quote", {})
    
    # Hotel address components
    streetName = hotel_state.get("streetName")
    cityName = hotel_state.get("cityName", "")
    streetNumber = hotel_state.get("streetNumber", "")
    hotelId = hotel_state.get("hotelId", "")
    
    # Hotel coordinates 
    coordinates = hotel_state.get("coordinates", {})
    
    # Flight info
    flight_number = user_state.get("flight_number", "")
    
    # Date/time information
    current_year = datetime.now().strftime("%Y") 
    current_month = datetime.now().strftime("%m")
    current_day = datetime.now().strftime("%d")

    # Track pickup direction
    is_pickup_from_airport = user_state.get("is_pickup_from_airport")
    
    # Hotel name
    hotel_name = (
        hotel_state.get("name", "")
        or guest_metadata.get("hotelName")
        or ""
    )
    
    # User contact information
    user_name = (
        guest_metadata.get("name")
        or user_state.get("contact_info", {}).get("full_name")
        or ""
    )
    
    user_email = (
        guest_metadata.get("email")
        or user_state.get("contact_info", {}).get("email")
        or ""
    )
    
    user_phone_no = (
        guest_metadata.get("phone")
        or user_state.get("contact_info", {}).get("phone_with_country_code")
        or ""
    )
    checkinDate = guest_metadata.get("checkInDate", "")
    checkoutDate = guest_metadata.get("checkOutDate", "")

    prompt = RYDER_PROMPT.format(
        user_input=user_state.get("user_input", ""),
        web_code=web_code,
        hotel_coordinates=coordinates,
        quote=quote,
        streetName=streetName,
        cityName=cityName,
        streetNumber=streetNumber,
        current_year=current_year,  
        current_month=current_month,
        pickUp=is_pickup_from_airport,
        current_day=current_day,
        hotel_name=hotel_name,
        hotelId=hotelId,
        flight_number=flight_number,
        user_name=user_name,
        user_email=user_email,
        user_phone_no=user_phone_no,
        checkInDate = checkinDate,
        checkOutDate = checkoutDate,
        airport_code= airport_code
    )
    logger.debug(f"Ryder Prompt: {prompt}")
    
    response = llm_with_tools.invoke(
        [{"role": "user", "content": prompt}] + user_state["messages"]
    )
    user_state["agent_output"] = response.content
    user_state["messages"] = [response]
    return user_state