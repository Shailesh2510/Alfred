import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchantMealPeriods = ({ merchantId }: any, queryConfig = {}) => {
	return useQuery(
		["merchant_meal_periods", merchantId],
		() => API.getMerchantMealPeriods({ merchantId }),
		{
			...queryConfig
		}
	)
}

export default useMerchantMealPeriods
