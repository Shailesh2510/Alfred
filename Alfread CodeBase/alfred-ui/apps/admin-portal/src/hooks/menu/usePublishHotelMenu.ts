import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const usePublishHotelMenu = (queryConfig = {}) => {
	return useMutation(
		({ menuId, hotelId }: any) => API.publishHotelMenu({ menuId, hotelId }),
		{
			...queryConfig
		}
	)
}

export default usePublishHotelMenu
