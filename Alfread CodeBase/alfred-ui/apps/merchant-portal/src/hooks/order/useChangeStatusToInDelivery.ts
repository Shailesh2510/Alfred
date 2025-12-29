import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToInDelivery = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version }: any) =>
			API.changeStatusToInDelivery({ orderId, version }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToInDelivery
