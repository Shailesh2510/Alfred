import { useMutation } from '@tanstack/react-query'
import { CancelOrderDTO } from '../types/order-types/cancelOrder'
import API from '../api/api'

const useCancelOrder = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({ orderId, orderCancelPayload }: CancelOrderDTO) =>
			API.cancelOrder(orderId, orderCancelPayload),
		...queryConfig
	})
}

export default useCancelOrder
