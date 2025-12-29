import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useHotelMealPeriods = ({ hotelId }: any, queryConfig = {}) => {
	return useQuery(
		["hotel_meal_periods", hotelId],
		() => API.getHotelMealPeriods({ hotelId }),
		{
			...queryConfig
		}
	)
}

export default useHotelMealPeriods
