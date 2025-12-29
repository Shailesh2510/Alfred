
from datetime import datetime
import pytz
from config.settings import settings
from models.states import ContactInfo, HotelState, PriceQuote
from langchain_core.messages import ToolMessage
from langgraph.types import Command
from langchain_core.tools.base import InjectedToolCallId
import requests
from typing import Annotated
from langchain_core.tools import tool
from utils.logger import logger
import json
from constants.constants import airport_coordinates


@tool
def get_rides_quote(
    tool_call_id: Annotated[str, InjectedToolCallId],
    web_code: str,
    airport_code: str,
    scheduled_date: str,
    hotel: HotelState,
    scheduled_time: str,
    flight_number: str,
    user_name: str,
    user_email: str,
    user_phone: str,
    contact_info: ContactInfo,
    is_pickup_from_airport: bool = False,
):
    """Fetch the price list for a given ride request.

    This function makes a synchronous API POST request to retrieve the price list
    for a ride based on the provided web code, origin and destination coordinates,
    and scheduled time details.

    Args:
        tool_call_id (str): The unique identifier for this tool call.
        web_code (str): The web code of the hotel or entity requesting the ride.
        is_pickup_from_airport (bool): Determine if the ride from airport→hotel only and then set to True, if not by default set to False.
        airport_code (str): The airport code for the airport being used for the ride.
        scheduled_date (str): The date for the scheduled ride in MM/DD/YYYY format. If the year and month are not provided, fetch the current year and month and use that instead
        scheduled_time (str): The time for the scheduled ride in HH:MM format.
        flight_number (str, optional): Flight number (required for airport pickups).
        user_name (str): The user's name.
        user_email (str): The user's email address.
        user_phone (str): The user's phone number.
        contact_info (ContactInfo, optional): Contact information of the traveler.
        is_pickup_from_airport (bool): Determine if the ride is from airport→hotel (True) or hotel→airport (False).


    Returns:
        dict: The price list data returned by the API, or an empty dict if the request fails.
    """
    payload={}
    hotel_state = hotel

    pickUp = is_pickup_from_airport 
    dropOff = not is_pickup_from_airport 
    logger.debug(f"Hotel state: {hotel_state}")

    est = pytz.timezone("America/New_York")
    now_est = datetime.now(est)
    current_date = now_est.strftime("%m/%d/%Y")
    current_time = now_est.strftime("%H:%M")

    logger.info(f"Current date and time in EST: {current_date} {current_time}")
    logger.info(f"Scheduled date and time: {scheduled_date} {scheduled_time}")

    try:
        scheduled_datetime = datetime.strptime(f"{scheduled_date} {scheduled_time}", "%m/%d/%Y %H:%M")
        scheduled_datetime = est.localize(scheduled_datetime)  # Ensure it's in EST
    except e:
        raise ValueError(f"Invalid date or time format. Please provide date as MM/DD/YYYY and time as HH:MM. Issue with: {e}")

    logger.info(f'Dates to compare: {scheduled_datetime} and {now_est}')

    # Compare scheduled time with current time
    if scheduled_datetime < now_est:
        raise ValueError("The scheduled date and time are in the past. Please provide a valid future date and time.")

    # Validate required fields
    missing_fields = []

    if contact_info is None:
        contact_info = {}
    
    full_name = contact_info.get("full_name") or user_name
    email = contact_info.get("email") or user_email
    phone_with_country_code = contact_info.get("phone_with_country_code") or user_phone

    if not airport_code:
        missing_fields.append("Airport code")
    if not scheduled_date:
        missing_fields.append("Scheduled date")
    if not scheduled_time:
        missing_fields.append("Scheduled time")
    if not hotel_state.get("streetName"):
        missing_fields.append("Hotel details")

    if not full_name:
        missing_fields.append("Full name")
    if not email:
        missing_fields.append("Email")
    if is_pickup_from_airport and not flight_number:
        missing_fields.append("Flight number")

    if missing_fields:
        logger.warning(f"Missing required fields for ride quote: {', '.join(missing_fields)}")
        raise ValueError(f"Missing required information to complete your ride quote: {', '.join(missing_fields)}. Please provide this information to continue.")

    ride_request_params = {
        "web_code": web_code,
        "pickUp": pickUp,
        "dropOff": dropOff,
        "airport_code": airport_code,
        "scheduled_date": scheduled_date,
        "scheduled_time": scheduled_time,
    }

    logger.debug(f"Requesting ride with parameters: {json.dumps(ride_request_params, default=str)}")

    if pickUp:
        payload = {
            "addressFrom": {
                "airport": True,
                "airportCode": airport_code,
                "latitude": airport_coordinates.get(airport_code, {}).get("latitude", 0.0),
                "longitude": airport_coordinates.get(airport_code, {}).get("longitude", 0.0)
            },
            "addressTo": {
                "streetName": hotel_state.get("streetName", ""),
                "cityName": hotel_state.get("cityName", ""),
                "streetNumber": hotel_state.get("streetNumber", ""),
                "latitude": hotel_state.get("coordinates", {}).get("x", ""),
                "longitude": hotel_state.get("coordinates", {}).get("y", ""),
                "airport": False
            },
            "tripDate": scheduled_date,
            "tripTime": scheduled_time
        }
        
    elif dropOff:
        payload = {
            "addressFrom": {
                "streetName": hotel_state.get("streetName", ""),
                "cityName": hotel_state.get("cityName", ""),
                "streetNumber": hotel_state.get("streetNumber", ""),
                "latitude": hotel_state.get("coordinates", {}).get("x", ""),
                "longitude": hotel_state.get("coordinates", {}).get("y", ""),
                "airport": False
            },
            "addressTo": {
                "airport": True,
                "airportCode": airport_code,
                "latitude": airport_coordinates.get(airport_code, {}).get("latitude", 0.0),
                "longitude": airport_coordinates.get(airport_code, {}).get("longitude", 0.0)
            },
            "tripDate": scheduled_date,
            "tripTime": scheduled_time
        }
        
        
    logger.debug(f"Generated payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(
            f"{settings.API_BASE_URL}/gateway/carmel/get-price-list/{web_code}",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.API_TOKEN}",
            },
        )
        data = response.json()
        if "data" not in data or not data["data"]:
            logger.error(f"Failed to fetch Carmel ride list. Response missing 'data' field or it's empty. Payload: {payload}")
            raise ValueError(f"Unable to fetch Carmel ride list due to missing or empty 'data' field in the response. Payload: {payload}")
        
        
        if data and "data" in data:            
            formatted_data = [
                {
                    "Car Class": car["carClassDesc"],
                    "Total Fare": car["fare"]["total"],
                    "Max Passengers": car["maxPassengers"],
                    "Max Luggage": car["maxLuggage"],
                    "Fare Id": car["fare"]["fareId"],
                    "Car Class Id": car["carClassID"],
                    "Service Fee": car["fare"]["total"] - car["fare"]["fare"],
                }
                for car in data["data"]
                if car["carClassID"] not in ("DX", "WV")
            ]
            logger.debug(f"Formatted data: {json.dumps(formatted_data, indent=2)}")

            logger.debug(f"Successfully processed ride quote with {len(formatted_data)} options")
            return Command(
                update={
                    "quote": PriceQuote(
                        {"quote_type": "rides", "date": scheduled_date, "time": scheduled_time, "airport_code": airport_code, "details": json.dumps(formatted_data)}
                    ),
                    "is_pickup_from_airport": is_pickup_from_airport,
                    "contact_info": ContactInfo({
                        "full_name": full_name,
                        "email": email,
                        "phone_with_country_code": phone_with_country_code
                    }),
                    "flight_number": flight_number,
                    "messages": [
                        ToolMessage(
                            "Successfully looked up price quote information",
                            tool_call_id=tool_call_id,
                        )
                    ],
                }
            )
        else:
            logger.error(f"No data found in API response: {json.dumps(data, indent=2)}")

    except requests.RequestException as e:
        logger.error(f"Ride Details Exception (RequestException): {str(e)}")
        return Command(update={
            "messages": [
                ToolMessage(
                    f"Ride Details Exception (RequestException): {str(e)}",
                    tool_call_id=tool_call_id,
                )
            ]
        })
    except (KeyError, TypeError) as e:
        logger.error(f"Ride Details Exception (KeyError/TypeError): {str(e)}")
        return Command(update={
            "messages": [
                ToolMessage(
                    f"Ride Details Exception (KeyError/TypeError): {str(e)}",
                    tool_call_id=tool_call_id,
                )
            ]
        })
    except Exception as e:
        logger.error(f"Unexpected error in get_rides_quote: {str(e)}")
        print(f"Unexpected error: {e}")
        return Command(update={
            "messages": [
                ToolMessage(
                    f"Unexpected error in get_rides_quote: {str(e)}",
                    tool_call_id=tool_call_id,
                )
            ]
        })

    logger.debug("Returning empty result due to error")
    return []