import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

export interface CancelOrderDTO {
	orderId: string
	orderCancelPayload: OrderCancelPayload
}

export interface OrderCancelPayload {
	reason: string
	option: string
}

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
