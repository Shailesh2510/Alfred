import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useGetMealPeriodIdByMerchantId = (queryConfig = {}) => {
	return useMutation(
		(merchantId: number) => API.getCarmelMealPeiordId(merchantId),
		{
			...queryConfig
		}
	)
}

export default useGetMealPeriodIdByMerchantId
