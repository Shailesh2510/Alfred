import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"
import { AssignHotelsWithMealPeriodsToMerchant } from "../../components/merchant-hotels/components/interfaces/assign-hotels-to-merchant"

const useAssignHotelsWithMealPeriodsToMerchant = (queryConfig = {}) => {
	return useMutation(
		({
			merchantId,
			hotelMealPeriodMappings
		}: AssignHotelsWithMealPeriodsToMerchant) =>
			API.assignHotelsToMerchantWithMealPeriods({
				merchantId,
				hotelMealPeriodMappings
			}),
		{
			...queryConfig
		}
	)
}

export default useAssignHotelsWithMealPeriodsToMerchant
