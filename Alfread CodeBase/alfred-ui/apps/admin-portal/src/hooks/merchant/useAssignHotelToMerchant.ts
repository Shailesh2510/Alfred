import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useGetAssignHotelsToMerchant = (queryConfig = {}) => {
	return useMutation(
		({ merchantId }: any) => API.getAssignedHotels({ merchantId }),
		{
			...queryConfig
		}
	)
}

export default useGetAssignHotelsToMerchant
