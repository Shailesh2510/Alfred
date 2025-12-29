import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useVoucherRefund = (queryConfig = {}) => {
	return useMutation(
		({ orderId, amount }: any) => API.voucherRefund({ orderId, amount }),
		{
			...queryConfig
		}
	)
}

export default useVoucherRefund
