import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useVoucherCodes = (
	{ page, voucherProgramId, voucherCode, voucherClaimed }: any,
	queryConfig = {}
) => {
	return useQuery(
		["voucher_codes", page, voucherProgramId, voucherCode, voucherClaimed],
		() =>
			API.getVoucherCodes({
				page,
				voucherProgramId,
				voucherCode,
				voucherClaimed
			}),
		{
			...queryConfig
		}
	)
}

export default useVoucherCodes
