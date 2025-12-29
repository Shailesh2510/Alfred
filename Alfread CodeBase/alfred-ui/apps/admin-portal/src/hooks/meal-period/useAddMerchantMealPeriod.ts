import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAddMerchantMealPeriod = (queryConfig = {}) => {
	return useMutation(
		({ merchantId, mealPeriodData }: any) =>
			API.addMerchantMealPeriod({ merchantId, mealPeriodData }),
		{
			...queryConfig
		}
	)
}

export default useAddMerchantMealPeriod
