import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useUpdateMerchantStatus = (queryConfig = {}) => {
	return useMutation(
		({ merchantId, isActive }: any) =>
			API.updateMerchantStatus({ merchantId, isActive }),
		{
			...queryConfig
		}
	)
}

export default useUpdateMerchantStatus
