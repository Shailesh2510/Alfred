import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchants = (webCode: any, queryConfig = {}) => {
	return useQuery(
		["merchants", webCode],
		() => API.getMerchantsAssociatedToHotels(webCode),
		{
			...queryConfig,
			enabled: !!webCode
		}
	)
}

export default useMerchants
