import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useRefundVoucher = (queryConfig = {}) => {
	return useMutation((orderId: string) => API.refundVoucher(orderId), {
		...queryConfig
	})
}

export default useRefundVoucher
