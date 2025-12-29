import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useEditHotel = (queryConfig = {}) => {
	return useMutation((hotelData: any) => API.editHotel(hotelData), {
		...queryConfig
	})
}

export default useEditHotel
