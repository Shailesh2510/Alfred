import API from "@/services/api"
import { useMutation } from "@tanstack/react-query"

const useEditMerchantModifier = (queryConfig = {}) => {
	return useMutation(
		({ modifierId, merchantId, modifierData }: any) =>
			API.editMerchantModifier({ modifierId, merchantId, modifierData }),
		{
			...queryConfig
		}
	)
}

export default useEditMerchantModifier
