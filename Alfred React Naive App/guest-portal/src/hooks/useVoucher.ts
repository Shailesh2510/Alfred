import { useMutation } from '@tanstack/react-query'
import API from '../api/api'

type VoucherPayload = {
	voucherCode: string
	hotelId: string
}

const useVoucher = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({ voucherCode, hotelId }: VoucherPayload) =>
			API.getVoucher(voucherCode, hotelId),
		...queryConfig
	})
}

export default useVoucher
