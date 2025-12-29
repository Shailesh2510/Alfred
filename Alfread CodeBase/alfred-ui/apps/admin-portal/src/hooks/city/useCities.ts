import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useCities = (queryConfig = {}) => {
	return useQuery(["cities"], () => API.getCities(), {
		...queryConfig
	})
}

export default useCities
