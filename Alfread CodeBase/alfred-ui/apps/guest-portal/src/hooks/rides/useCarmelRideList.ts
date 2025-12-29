import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useCarmelRideList = (queryConfig = {}) => {
	return useMutation(
		({ hotelId, rideList }: any) => API.getPriceList(hotelId, rideList),
		{
			...queryConfig
		}
	)
}

export default useCarmelRideList
