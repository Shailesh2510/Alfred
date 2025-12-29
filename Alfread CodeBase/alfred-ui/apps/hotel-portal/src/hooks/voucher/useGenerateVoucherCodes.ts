import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useGenerateVoucherCodes = (queryConfig = {}) => {
	return useMutation(
		({ numberOfCodes, voucherProgramId }: any) =>
			API.generateVoucherCodes({ numberOfCodes, voucherProgramId }),
		{
			...queryConfig
		}
	)
}

export default useGenerateVoucherCodes
