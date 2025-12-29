import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToPending: any = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version }: any) =>
			API.changeStatusToPending({ orderId, version }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToPending
