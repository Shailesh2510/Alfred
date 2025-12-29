from typing import Any, List
from typing_extensions import Annotated, TypedDict
from langgraph.graph.message import add_messages


class Coordinates(TypedDict):
    x: float
    y: float


class HotelState(TypedDict):
    uuid: str
    hotelId: int
    name: str
    web_code: str
    streetName: str
    cityName: str
    streetNumber: str
    coordinates: Coordinates

class SearchResults(TypedDict):
    title: str
    url: str
    content: str    

class PriceQuote(TypedDict):
    quote_type: str
    date: str
    time: str
    airport_code: str
    details: list[Any]

class ContactInfo(TypedDict):
    full_name: str
    email: str
    phone_with_country_code: str

def replace_quote(current: Any, new: Any) -> Any:
    """Replace the current quote with a new one."""
    return new

def replace_trip_details(current: Any, new: Any) -> Any:
    """Replace current trip details with new ones."""
    return new

def replace_boolean(current: bool, new: bool) -> bool:
    """Replace a boolean value."""
    return new

class UserState(TypedDict):
    user_input: str
    user_preferences: str
    agent_output: str
    session_id: str
    hotel: HotelState
    quote: Annotated[PriceQuote, replace_quote]
    search_results: list[SearchResults]
    messages: Annotated[list, add_messages]
    selected_ride_type: str
    is_pickup_from_airport: Annotated[bool, replace_boolean]
    contact_info: ContactInfo
    flight_number: str
    guest_metadata: dict[str, Any]