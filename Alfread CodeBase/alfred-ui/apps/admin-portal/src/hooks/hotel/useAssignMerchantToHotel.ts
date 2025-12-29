import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAssignMerchantToHotel = (queryConfig = {}) => {
	return useMutation(
		({ hotelId, merchantId, mealPeriodIds }: any) =>
			API.assignMerchantToHotel({ hotelId, merchantId, mealPeriodIds }),
		{
			...queryConfig
		}
	)
}

export default useAssignMerchantToHotel
