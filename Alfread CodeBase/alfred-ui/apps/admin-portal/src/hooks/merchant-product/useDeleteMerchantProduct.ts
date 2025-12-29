import API from "@/services/api"
import { useMutation } from "@tanstack/react-query"

const useDeleteMerchantProduct = (queryConfig = {}) => {
	return useMutation(
		({ productId, merchantId }: any) =>
			API.deleteMerchantProduct({
				productId,
				merchantId
			}),
		{
			...queryConfig
		}
	)
}

export default useDeleteMerchantProduct
