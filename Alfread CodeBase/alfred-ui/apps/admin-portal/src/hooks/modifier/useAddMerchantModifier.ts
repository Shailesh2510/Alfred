import API from "@/services/api"
import { useMutation } from "@tanstack/react-query"

const useAddMerchantModifier = (queryConfig = {}) => {
	return useMutation(
		({ merchantId, modifierData }: any) =>
			API.addMerchantModifier({ merchantId, modifierData }),
		{
			...queryConfig
		}
	)
}

export default useAddMerchantModifier
