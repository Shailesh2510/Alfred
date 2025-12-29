import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useUpdateProductStock = (queryConfig = {}) => {
	return useMutation(
		({ merchantId, itemId, out }: any) =>
			API.updateProductStock({ merchantId, itemId, out }),
		{
			...queryConfig
		}
	)
}

export default useUpdateProductStock
