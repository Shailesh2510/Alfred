import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchantModifier = (
	{ modifierId, merchantId }: any,
	queryConfig = {}
) => {
	return useQuery(
		["merchant_modifier", modifierId, merchantId],
		() => API.getMerchantModifier({ modifierId, merchantId }),
		{
			...queryConfig
		}
	)
}

export default useMerchantModifier
