import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useOrderById = ({ orderId }: any, queryConfig = {}) => {
	return useQuery(["order", orderId], () => API.getOrderById({ orderId }), {
		...queryConfig
	})
}

export default useOrderById
