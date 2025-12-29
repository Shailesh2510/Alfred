import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAddVoucherProgram = (queryConfig = {}) => {
	return useMutation(
		({ voucherProgramData }: any) =>
			API.addVoucherProgram({ voucherProgramData }),
		{
			...queryConfig
		}
	)
}

export default useAddVoucherProgram
