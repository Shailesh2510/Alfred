import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const usePaymentRefund = (queryConfig = {}) => {
	return useMutation(
		({ orderId, amount, reason, note }: any) =>
			API.paymentRefund({ orderId, amount, reason, note }),
		{
			...queryConfig
		}
	)
}

export default usePaymentRefund
