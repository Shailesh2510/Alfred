import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useVoucherPrograms = (
	{ page, name, type, hotelId, isActive }: any,
	queryConfig = {}
) => {
	return useQuery(
		["voucher_programs", page, name, type, hotelId, isActive],
		() => API.getVoucherPrograms({ page, name, type, hotelId, isActive }),
		{
			...queryConfig
		}
	)
}

export default useVoucherPrograms
