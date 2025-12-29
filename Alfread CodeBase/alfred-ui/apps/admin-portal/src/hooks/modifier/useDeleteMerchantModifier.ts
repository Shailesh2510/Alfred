import API from "@/services/api"
import { useMutation } from "@tanstack/react-query"

const useDeleteMerchantModifier = (queryConfig = {}) => {
	return useMutation(
		({ modifierId, merchantId }: any) =>
			API.deleteMerchantModifier({
				modifierId,
				merchantId
			}),
		{
			...queryConfig
		}
	)
}

export default useDeleteMerchantModifier
