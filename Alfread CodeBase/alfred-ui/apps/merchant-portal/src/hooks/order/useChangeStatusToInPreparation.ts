import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useChangeStatusToInPreparation = (queryConfig = {}) => {
	return useMutation(
		({ orderId, version }: any) =>
			API.changeStatusToInPreparation({ orderId, version }),
		{
			...queryConfig
		}
	)
}

export default useChangeStatusToInPreparation
