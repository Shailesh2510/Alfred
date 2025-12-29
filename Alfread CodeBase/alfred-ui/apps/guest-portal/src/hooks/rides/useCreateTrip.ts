import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useCreateTrip = (queryConfig = {}) => {
	return useMutation(
		({ hotelId, createTrip }: any) => API.createTrip(hotelId, createTrip),
		{
			...queryConfig
		}
	)
}

export default useCreateTrip
