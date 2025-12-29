import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useGetMerchantCoverImagePresignedUrl = (mutationConfig = {}) => {
	return useMutation(
		(merchantId: any) => API.getMerchantCoverImagePresignedUrl(merchantId),
		{
			...mutationConfig
		}
	)
}

export default useGetMerchantCoverImagePresignedUrl
