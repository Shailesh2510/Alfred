import json
from typing import Annotated
from langchain_core.tools.base import InjectedToolCallId
import requests
from langchain_core.tools import tool
from config.settings import settings
from models.states import ContactInfo, HotelState, PriceQuote
from constants.constants import airport_coordinates
from utils.parse_phone_number import parse_phone_number
from utils.format_datetime import format_datetime
from utils.logger import logger
from langchain_core.messages import ToolMessage
from langgraph.types import Command

@tool
def book_ride(
    tool_call_id: Annotated[str, InjectedToolCallId],
    web_code: str,
    selected_ride_type: str, 
    quote: PriceQuote, 
    hotel: HotelState, 
    contact_info: ContactInfo, 
    scheduledTime: str, 
    scheduledDate: str,
    airport_code: str,
    flight_number: str,
    pickUp: bool = False,
):
    """
    Book a ride for the user and update the trip details with Carmel.

    This function:
    1. Fetches merchant details for rides
    2. Selects the appropriate ride option from quotes
    3. Creates a ride order
    4. Updates the trip details with Carmel API

    Args:
        web_code (str): The hotel web code.
        selected_ride_type (str): The user's selected ride type (e.g., "SUV", "Sedan").
        quote (PriceQuote): The fetched ride options for the selected date and time.
        hotel (HotelState): The hotel details (hotelId, street name, city, coordinates, etc.).
        contact_info (ContactInfo): The user's contact details.
        scheduledTime (str): The scheduled time for the ride (HH:mm).
        scheduledDate (str): The scheduled date for the ride (MM/DD/yyyy).
        airport_code (str): The airport code for the ride.
        flight_number (str): The user's flight number.
        pickUp (bool): The pickUp flag from user state

    Returns:
        dict: Combined response from order creation and trip update APIs.
    """

    ride_details = {
        "Ride Type": selected_ride_type,
        "Flight Number": flight_number,
        "Quote": quote,
        "Hotel": hotel,
        "Contact": contact_info,
        "Date": scheduledDate,
        "Time": scheduledTime,
        "PickUp": pickUp,
        "Airport": airport_code,
    }

    logger.debug(f"Processing ride booking: {json.dumps(ride_details, default=str)}")

    try:
        quote_details = quote.get('details', []) if isinstance(quote, dict) else quote or []
        merchant_response = requests.get(
            f"{settings.API_BASE_URL}/gateway/hotel/public/get-merchants/{web_code}",
            headers={"Authorization": f"Bearer {settings.API_TOKEN}"}
        )
        merchant_response.raise_for_status()
        merchants = merchant_response.json().get('data', [])
        
        rides_merchant = next((merchant for merchant in merchants if merchant.get('merchant_type') == 'RIDES'), None)
        
        if not rides_merchant:
            logger.error(f"No rides merchant found for web code '{web_code}'. Ensure that the merchant type 'RIDES' exists.")
            raise ValueError(f"No rides merchant found for web code '{web_code}'. Ensure that the merchant type 'RIDES' exists.")
        
        selected_ride = next((ride for ride in quote_details if ride.get('Car Class', '').strip().startswith(selected_ride_type)), None)
        
        if not selected_ride:
            logger.error(f"Selected ride type '{selected_ride_type}' not found in quote details.")
            raise ValueError(f"Selected ride type '{selected_ride_type}' not found in quote details.")
        
        formatted_datetime = format_datetime(scheduledDate, scheduledTime)
        if not formatted_datetime:
            logger.error("Invalid date or time format provided. Ensure both scheduledDate and scheduledTime are valid.")
            raise ValueError("Invalid date or time format provided. Ensure both scheduledDate and scheduledTime are valid.")
        
        meal_period_id = rides_merchant.get('meal_period_ids', [None])[0] or None
        ride_grand_total = float(selected_ride.get('Total Fare', 0.0))
        ride_tip = str(round(float(selected_ride.get('Service Fee', 0.0)), 2))
        # Prepare order payload
        order_payload = {
            "tip": ride_tip,
            "items": [],
            "comment": "",
            "hotelId": hotel.get('hotelId', ''),
            "orderType": "PAY_LATER",
            "clientName": contact_info.get("full_name", ""),
            "roomNumber": "",
            "clientEmail": contact_info.get("email", ""),
            "mealPeriodId": meal_period_id,
            "clientNumber": contact_info.get("phone_with_country_code", ""),
            "scheduledDate": formatted_datetime,
            "numberOfCutleries": "1",
            "hasAlcohol": False,
            "isCatering": False,
            "merchantId": rides_merchant.get('id', ''),
            "rideGrandTotal": ride_grand_total,
            "referralId": None
        }
        
        logger.debug(f"Order payload: {order_payload}")
        
        # Create the order
        response = requests.post(
            f"{settings.API_BASE_URL}/gateway/order/public/create-order",
            json=order_payload,
            headers={"Authorization": f"Bearer {settings.API_TOKEN}"}
        )

        order_response = response.json()

        if not order_response.get("nonce"):
            logger.error("Order creation failed!")
            raise ValueError("Order creation failed!")
        
        logger.debug(f"Order creation response: {order_response}")
        
        nonce = order_response.get("nonce", "")
        phone_info = parse_phone_number(contact_info.get("phone_with_country_code", ""))

        # Split full_name into first and last name
        first_name, *last_name_parts = contact_info.get('full_name', '').split(' ', 1)
        last_name = ' '.join(last_name_parts) if last_name_parts else ''
        common_trip_update_payload = {
            "tripDate": scheduledDate,
            "tripTime": scheduledTime,
            "customerFirstName":first_name,
            "customerLastName" :last_name,
            "customerPhone": {
                "countryCode": phone_info['country_code'],
                "number": phone_info['number']
            },
            "emailAddr": contact_info.get("email", ""),
            "carClassID": selected_ride.get("Car Class Id", ""),
            "fareId": selected_ride.get("Fare Id", "")
        }

        if pickUp:
            trip_update_payload = {
                "nonce": nonce,
                "addressFrom": {
                    "airport": True,
                    "airportCode": airport_code,
                    "latitude": airport_coordinates.get(airport_code, {}).get("latitude", 0.0),
                    "longitude": airport_coordinates.get(airport_code, {}).get("longitude", 0.0),
                    "flightNumber": flight_number
                },
                "addressTo": {
                    "streetName": hotel.get("streetName", ""),
                    "cityName": hotel.get("cityName", ""),
                    "streetNumber": hotel.get("streetNumber", ""),
                    "latitude": hotel.get("coordinates", {}).get("x", ""),
                    "longitude": hotel.get("coordinates", {}).get("y", ""),
                    "airport": False
                },
                **common_trip_update_payload
            }
        else:
            trip_update_payload = {
                "nonce": nonce,
                "addressFrom": {
                    "streetName": hotel.get("streetName", ""),
                    "cityName": hotel.get("cityName", ""),
                    "streetNumber": hotel.get("streetNumber", ""),
                    "latitude": hotel.get("coordinates", {}).get("x", ""),
                    "longitude": hotel.get("coordinates", {}).get("y", ""),
                    "airport": False
                },
                "addressTo": {
                    "airport": True,
                    "airportCode": airport_code,
                    "latitude": airport_coordinates.get(airport_code, {}).get("latitude", 0.0),
                    "longitude": airport_coordinates.get(airport_code, {}).get("longitude", 0.0)
                },
                **common_trip_update_payload
            }
        
        logger.debug(f"Trip update payload: {trip_update_payload}")
        
        trip_update_response = requests.post(
            f"{settings.API_BASE_URL}/gateway/carmel/post-trip/{web_code}",
            json=trip_update_payload,
            headers={"Authorization": f"Bearer {settings.API_TOKEN}"}
        )
        
        trip_update_result = trip_update_response.json()

        if not trip_update_result or (isinstance(trip_update_result, list) and len(trip_update_result) == 0):
            logger.error("Trip update failed: Response is empty or invalid.")
            raise ValueError("Trip update failed: Response is empty or invalid.")
        
        
        
        logger.debug(f"Trip update response: {trip_update_result}")
        
        payment_payload = {
            "amount": 0.0,
            "orderId": nonce,
            "clientName": contact_info.get("full_name", ""),
            "clientNumber": contact_info.get("phone_with_country_code", ""),
            "clientEmail": contact_info.get("email", ""),
            "paymentMethodType": "card",
            "isCateringOrder": False,
            "isRideService": True
        }
        
        payment_init_response = requests.post(
            f"{settings.API_BASE_URL}/payment/init",
            json=payment_payload,
            headers={"Authorization": f"Bearer {settings.API_TOKEN}"}
        )

        payment_init_result = payment_init_response.json()

        if "error" in payment_init_result:
            logger.error("Payment initialization failed: Missing clientSecret in response.")
            raise ValueError("Payment initialization failed: Missing clientSecret in response.")
        
        logger.debug(f"Payment init response: {payment_init_result}")
        
        return {
            "order_response": order_response,
            "trip_update_response": trip_update_result,
            "payment_init_response": payment_init_result
        }
    
    except requests.RequestException as e:
        logger.error(f"Request Exception in ride booking process: {str(e)}")
        return Command(update={
            "messages": [
                ToolMessage(
                    f"Request Exception in ride booking process: {str(e)}",
                    tool_call_id=tool_call_id,
                )
            ]
        })
    except Exception as e:
        logger.error(f"Unexpected error in ride booking: {str(e)}")
        return Command(update={
            "messages": [
                ToolMessage(
                    f"Unexpected error in ride booking: {str(e)}",
                    tool_call_id=tool_call_id,
                )
            ]
        })