import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useVoucherPrograms = (queryConfig = {}) => {
	return useQuery(["voucher_programs"], () => API.getVoucherPrograms(), {
		...queryConfig
	})
}

export default useVoucherPrograms
