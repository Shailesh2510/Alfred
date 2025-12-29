import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToConfirmed = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version }: any) =>
			API.changeStatusToConfirmed({ orderId, version }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToConfirmed
