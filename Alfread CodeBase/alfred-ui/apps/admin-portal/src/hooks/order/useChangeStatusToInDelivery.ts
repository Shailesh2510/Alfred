import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToInDelivery = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version, hotelId }: any) =>
			API.changeStatusToInDelivery({ orderId, version, hotelId }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToInDelivery
