import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useCategorizedMerchantProducts = (
	{ merchantId, menuId }: any,
	queryConfig = {}
) => {
	return useQuery(
		["categorized_merchant_products", merchantId, menuId],
		() => API.getCategorizedMerchantProducts({ merchantId, menuId }),
		{
			...queryConfig
		}
	)
}

export default useCategorizedMerchantProducts
