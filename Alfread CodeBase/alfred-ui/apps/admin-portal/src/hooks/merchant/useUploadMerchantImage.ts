import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useUploadMerchantImage = (queryConfig = {}) => {
	return useMutation(
		({ url, file }: any) => API.uploadMerchantProductImage(url, file),
		{
			...queryConfig
		}
	)
}

export default useUploadMerchantImage
