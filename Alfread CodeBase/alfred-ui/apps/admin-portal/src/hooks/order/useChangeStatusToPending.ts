import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToPending: any = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version, hotelId }: any) =>
			API.changeStatusToPending({ orderId, version, hotelId }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToPending
