import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchant = ({ merchantId }: any, queryConfig = {}) => {
	return useQuery(
		["merchant", merchantId],
		() => API.getMerchant({ merchantId }),
		{
			...queryConfig
		}
	)
}

export default useMerchant
