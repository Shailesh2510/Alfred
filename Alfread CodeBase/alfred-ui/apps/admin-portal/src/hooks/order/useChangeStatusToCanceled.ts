import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToCanceled = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version, hotelId, cancelReason, cancelOption }: any) =>
			API.changeStatusToCanceled({
				orderId,
				version,
				hotelId,
				cancelReason,
				cancelOption
			}),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToCanceled
