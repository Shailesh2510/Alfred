import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useVoucher = (queryConfig = {}) => {
	return useMutation(
		({ voucherCode, hotelId }: any) => API.getVoucher({ voucherCode, hotelId }),
		{
			...queryConfig
		}
	)
}

export default useVoucher
