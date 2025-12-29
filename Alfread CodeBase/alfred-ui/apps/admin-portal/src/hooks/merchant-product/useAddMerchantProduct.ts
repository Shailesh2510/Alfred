import API from "@/services/api"
import { useMutation } from "@tanstack/react-query"

const useAddMerchantProduct = (queryConfig = {}) => {
	return useMutation(
		({ merchantId, productData }: any) =>
			API.addMerchantProduct({ merchantId, productData }),
		{
			...queryConfig
		}
	)
}

export default useAddMerchantProduct
