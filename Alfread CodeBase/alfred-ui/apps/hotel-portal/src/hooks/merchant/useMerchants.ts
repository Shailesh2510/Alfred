import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchants = (queryConfig = {}) => {
	return useQuery(["merchants"], () => API.getMerchants(), {
		...queryConfig
	})
}

export default useMerchants
