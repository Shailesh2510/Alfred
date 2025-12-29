import API from "@/services/api"
import { useMutation } from "@tanstack/react-query"

const useEditMerchantPorducts = (queryConfig = {}) => {
	return useMutation(
		({ productId, merchantId, productData }: any) =>
			API.editMerchantProduct({ productId, merchantId, productData }),
		{
			...queryConfig
		}
	)
}

export default useEditMerchantPorducts
