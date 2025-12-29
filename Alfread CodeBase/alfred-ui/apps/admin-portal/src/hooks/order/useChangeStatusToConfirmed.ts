import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToConfirmed = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version, hotelId }: any) =>
			API.changeStatusToConfirmed({ orderId, version, hotelId }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToConfirmed
