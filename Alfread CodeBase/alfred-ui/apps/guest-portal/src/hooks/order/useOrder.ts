import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useOrder = ({ orderId }: any, queryConfig = {}) => {
	return useQuery(["order", orderId], () => API.getOrder({ orderId }), {
		...queryConfig
	})
}

export default useOrder
