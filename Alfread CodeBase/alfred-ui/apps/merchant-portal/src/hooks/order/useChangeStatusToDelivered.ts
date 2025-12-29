import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToDelivered: any = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version }: any) =>
			API.changeStatusToDeliverd({ orderId, version }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToDelivered
