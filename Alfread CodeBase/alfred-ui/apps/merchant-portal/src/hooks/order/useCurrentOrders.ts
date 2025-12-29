import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useCurrentOrders = (queryConfig = {}) => {
	return useQuery(["current_orders"], () => API.getCurrentOrders(), {
		...queryConfig
	})
}

export default useCurrentOrders
