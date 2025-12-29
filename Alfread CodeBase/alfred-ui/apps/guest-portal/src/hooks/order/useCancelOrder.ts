import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"
import { CancelOrderDTO } from "@/interfaces/cancelOrder"

const useCancelOrder = (queryConfig = {}) => {
	return useMutation(
		({ orderId, orderCancelPayload }: CancelOrderDTO) =>
			API.cancelOrder(orderId, orderCancelPayload),
		{
			...queryConfig
		}
	)
}

export default useCancelOrder
