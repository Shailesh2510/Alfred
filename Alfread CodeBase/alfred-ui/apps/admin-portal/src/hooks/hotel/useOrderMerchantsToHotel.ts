import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useOrderMerchantsToHotel = (queryConfig = {}) => {
	return useMutation(
		({ hotelId, merchants }: any) =>
			API.orderMerchantsToHotel({ hotelId, merchants }),
		{
			...queryConfig
		}
	)
}

export default useOrderMerchantsToHotel
