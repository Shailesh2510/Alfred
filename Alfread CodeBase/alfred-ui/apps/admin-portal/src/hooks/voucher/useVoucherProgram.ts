import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useVoucherProgram: any = (
	{ voucherProgramId }: any,
	queryConfig = {}
) => {
	return useQuery(
		["voucher_program", voucherProgramId],
		() => API.getVoucherProgram({ voucherProgramId }),
		{
			...queryConfig
		}
	)
}

export default useVoucherProgram
