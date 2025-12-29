import { IHotel } from "@/interfaces/hotel"

export const findHotelByWebCode = (
	hotels: IHotel[] | undefined,
	webCode: string | string[] | undefined
) => {
	return hotels?.find(hotel => hotel.webCode === webCode) || null
}
