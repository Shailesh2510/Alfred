import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToDelivered = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version, hotelId }: any) =>
			API.changeStatusToDeliverd({ orderId, version, hotelId }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToDelivered
