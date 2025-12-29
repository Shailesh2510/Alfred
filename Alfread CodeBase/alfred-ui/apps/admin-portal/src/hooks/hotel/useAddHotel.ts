import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAddHotel = (queryConfig = {}) => {
	return useMutation((hotelData: any) => API.addHotel(hotelData), {
		...queryConfig
	})
}

export default useAddHotel
