from models.states import HotelState
from langchain_core.messages import ToolMessage
from langgraph.types import Command
from langchain_core.tools.base import InjectedToolCallId
import requests
from typing import Annotated
from langchain_core.tools import tool
from utils.logger import logger
from config.settings import settings

@tool
def get_hotel_details(
    tool_call_id: Annotated[str, InjectedToolCallId], hotelName: str
):
    """
    Retrieves hotel details for a given hotel name and stores them in the HotelState.

    **Functionality:**
    - Fetches hotel details, including UUID, Id, name, web code, address, city, and coordinates.
    - Stores the retrieved data in the `HotelState` for future reference.

    **Stored HotelState Fields:**
    - `uuid`: Unique identifier of the hotel which will be _id not Id.
    - `name`: Name of the hotel.
    - `web_code`: Web code for hotel identification.
    - `streetName`: Street name of the hotel’s address.
    - `cityName`: City where the hotel is located.
    - `streetNumber`: Street number of the hotel.
    - `coordinates`: GPS coordinates of the hotel (latitude, longitude).
    - `hotelId`: ID of the hotel.

    **Usage:**
    - This tool ensures hotel details are fetched only once and stored to prevent redundant API calls.
    - Used in the airport transfer booking process to identify the correct hotel for the user.

    **Parameters:**
    - `tool_call_id` (str): Injected tool call ID.
    - `hotelName` (str): Name of the hotel to fetch details for.

    **Returns:**
    - A `Command` object containing the stored hotel details.
    """
    logger.info(f"Fetching hotel details for hotel: {hotelName}")
    try:
        response = requests.post(
            f"{settings.API_BASE_URL}/gateway/hotel/public/hotel-details",
            headers={
                "Authorization": f"Bearer {settings.API_TOKEN}"
            },
            json={"hotelName": hotelName},
        )
        logger.debug(f"Hotel Details Response: {response.json()}")
        data = response.json()

        if response.status_code == 404 or "data" not in data or not data["data"]:
            logger.warning(f"Hotel not found for name: {hotelName}")
            raise ValueError(f"Hotel with name '{hotelName}' not found. Please provide a valid hotel name.")

        hotel_data = data["data"][0]
        hotel = HotelState(
            {
                "uuid": hotel_data["_id"],
                "hotelId": hotel_data["id"],
                "name": hotel_data["name"],
                "web_code": hotel_data["webCode"],
                "streetName": hotel_data["addressStreet"],
                "cityName": hotel_data["cityName"],
                "streetNumber": hotel_data["addressNumber"],
                "coordinates": hotel_data["coordinates"],
            }
        )
        logger.debug(f'Hotel Details are : {hotel}')
        state_update = {
            "hotel": hotel,  
            "messages": [
                ToolMessage(
                    "Successfully looked up hotel information",
                    tool_call_id=tool_call_id,
                )
            ],
        }

        # return data["webCode"]
        return Command(update=state_update)

    except requests.RequestException as e:
        logger.info(f"Request failed while fetching hotel details: {e}")
        return Command(update={
            "messages": [
                ToolMessage(
                    "There was an error retrieving hotel details. Please try again later.",
                    tool_call_id=tool_call_id,
                )
            ]
        })
