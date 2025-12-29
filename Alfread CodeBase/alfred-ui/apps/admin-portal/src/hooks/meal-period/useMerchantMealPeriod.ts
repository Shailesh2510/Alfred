import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchantMealPeriod = (
	{ mealPeriodId, merchantId }: any,
	queryConfig = {}
) => {
	return useQuery(
		["merchant_meal_period", mealPeriodId, merchantId],
		() => API.getMerchantMealPeriod({ merchantId, mealPeriodId }),
		{
			...queryConfig
		}
	)
}

export default useMerchantMealPeriod
