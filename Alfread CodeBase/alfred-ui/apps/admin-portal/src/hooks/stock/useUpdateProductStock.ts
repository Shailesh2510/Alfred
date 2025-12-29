import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useUpdateProductStock = (queryConfig = {}) => {
	return useMutation(
		({ merchantId, itemId, availableAfter, out }: any) =>
			API.updateProductStock({ merchantId, itemId, availableAfter, out }),
		{
			...queryConfig
		}
	)
}

export default useUpdateProductStock
