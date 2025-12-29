import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchantModifiers = ({ merchantId }: any, queryConfig = {}) => {
	return useQuery(
		["merchant_modifiers", merchantId],
		() => API.getMerchantModifiers({ merchantId }),
		{
			...queryConfig
		}
	)
}

export default useMerchantModifiers
