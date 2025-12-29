import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchantProduct = (
	{ productId, merchantId }: any,
	queryConfig = {}
) => {
	return useQuery(
		["merchant_product", productId, merchantId],
		() => API.getMerchantProduct({ productId, merchantId }),
		{
			...queryConfig
		}
	)
}

export default useMerchantProduct
