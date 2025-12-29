import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useGetMerchantImagePresignedUrl = (mutationConfig = {}) => {
	return useMutation(
		(merchantId: any) => API.getMerchantImagePresignedUrl(merchantId),
		{
			...mutationConfig
		}
	)
}

export default useGetMerchantImagePresignedUrl
