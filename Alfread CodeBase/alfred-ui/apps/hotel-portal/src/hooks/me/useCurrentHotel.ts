import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useCurrentHotel = (queryConfig = {}) => {
	return useQuery(["me"], () => API.getCurrentHotel(), {
		...queryConfig
	})
}

export default useCurrentHotel
