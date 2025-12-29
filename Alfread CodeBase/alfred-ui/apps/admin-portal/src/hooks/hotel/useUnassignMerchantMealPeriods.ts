import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useUnassignMerchantMealPeriods = (queryConfig = {}) => {
	return useMutation(
		({ hotelId, merchantId, mealPeriodIds }: any) =>
			API.unassignMerchantMealPeriods({ hotelId, merchantId, mealPeriodIds }),
		{
			...queryConfig
		}
	)
}

export default useUnassignMerchantMealPeriods
