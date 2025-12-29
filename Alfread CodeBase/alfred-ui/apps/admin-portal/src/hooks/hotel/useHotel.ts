import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useHotel = ({ hotelId }: any, queryConfig = {}) => {
	return useQuery(["hotel", hotelId], () => API.getHotel({ hotelId }), {
		...queryConfig
	})
}

export default useHotel
