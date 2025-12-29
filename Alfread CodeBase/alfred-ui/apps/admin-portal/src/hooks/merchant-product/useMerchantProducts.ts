import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchantProducts = ({ merchantId }: any, queryConfig = {}) => {
	return useQuery(
		["merchant_products", merchantId],
		() => API.getMerchantProducts({ merchantId }),
		{
			...queryConfig
		}
	)
}

export default useMerchantProducts
