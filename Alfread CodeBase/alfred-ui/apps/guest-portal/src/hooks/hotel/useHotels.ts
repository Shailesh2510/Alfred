import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useHotels = (queryConfig = {}) => {
	return useQuery(["hotels"], () => API.getHotels(), {
		...queryConfig
	})
}

export default useHotels
