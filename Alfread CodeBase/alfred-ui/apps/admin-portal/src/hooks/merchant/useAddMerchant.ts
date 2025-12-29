import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAddMerchant = (queryConfig = {}) => {
	return useMutation((merchantData: any) => API.addMerchant(merchantData), {
		...queryConfig
	})
}

export default useAddMerchant
