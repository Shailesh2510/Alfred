import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToInPreparation = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version, hotelId }: any) =>
			API.changeStatusToInPreparation({ orderId, version, hotelId }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToInPreparation
