import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useDeleteMerchantMealPeriod = (queryConfig = {}) => {
	return useMutation(
		({ merchantId, mealPeriodId }: any) =>
			API.deleteMerchantMealPeriod({ merchantId, mealPeriodId }),
		{
			...queryConfig
		}
	)
}

export default useDeleteMerchantMealPeriod
