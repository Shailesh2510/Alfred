import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useEditMerchantMealPeriod = (queryConfig = {}) => {
	return useMutation(
		({ merchantId, mealPeriodId, mealPeriodData }: any) =>
			API.editMerchantMealPeriod({ merchantId, mealPeriodId, mealPeriodData }),
		{
			...queryConfig
		}
	)
}

export default useEditMerchantMealPeriod
