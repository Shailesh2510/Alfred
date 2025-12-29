import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useCurrentMerchant = (queryConfig = {}) => {
	return useQuery(["me"], () => API.getCurrentMerchant(), {
		...queryConfig
	})
}

export default useCurrentMerchant
