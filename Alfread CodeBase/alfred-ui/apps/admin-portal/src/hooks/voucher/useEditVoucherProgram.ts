import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useEditVoucherProgram = (queryConfig = {}) => {
	return useMutation(
		({ voucherProgramId, voucherProgramData }: any) =>
			API.editVoucherProgram({ voucherProgramId, voucherProgramData }),
		{
			...queryConfig
		}
	)
}

export default useEditVoucherProgram
