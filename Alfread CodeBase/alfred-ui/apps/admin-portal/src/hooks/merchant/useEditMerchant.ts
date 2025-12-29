import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useEditMerchant = (queryConfig = {}) => {
	return useMutation((merchantData: any) => API.editMerchant(merchantData), {
		...queryConfig
	})
}

export default useEditMerchant
