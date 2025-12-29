import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useHotelMenuCategories = ({ hotelId }: any, queryConfig = {}) => {
	return useQuery(
		["hotel_menu_categories", hotelId],
		() => API.getHotelMenuCategories({ hotelId }),
		{
			...queryConfig
		}
	)
}

export default useHotelMenuCategories
