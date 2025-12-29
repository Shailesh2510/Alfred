import { useMutation } from '@tanstack/react-query'
import API from '../api/api'

const useRefundVoucher = (queryConfig = {}) => {
	return useMutation({
		mutationFn: (orderId: string) => API.refundVoucher(orderId),
		...queryConfig
	})
}

export default useRefundVoucher
