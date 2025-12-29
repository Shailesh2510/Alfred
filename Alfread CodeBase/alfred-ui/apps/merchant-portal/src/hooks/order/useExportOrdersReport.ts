import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useExportOrdersReport = (queryConfig = {}) => {
	return useMutation(
		({ page, fromDate, toDate, status, hotelId }: any) =>
			API.exportOrdersReport({ page, fromDate, toDate, status, hotelId }),
		{
			...queryConfig
		}
	)
}

export default useExportOrdersReport
