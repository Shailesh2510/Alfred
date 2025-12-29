import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useDeleteOrder = (queryConfig = {}) => {
	return useMutation(({ orderId }: any) => API.deleteOrder({ orderId }), {
		...queryConfig
	})
}

export default useDeleteOrder
