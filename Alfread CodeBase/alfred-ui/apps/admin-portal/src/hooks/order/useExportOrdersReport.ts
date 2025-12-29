import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useExportOrdersReport = (queryConfig = {}) => {
	return useMutation(
		({
			page,
			fromDate,
			toDate,
			status,
			hotelId,
			merchantId,
			orderType,
			mealPeriodId,
			clientName,
			clientNumber,
			clientEmail,
			voucherCode
		}: any) =>
			API.exportOrdersReport({
				page,
				fromDate,
				toDate,
				status,
				hotelId,
				merchantId,
				orderType,
				mealPeriodId,
				clientName,
				clientNumber,
				clientEmail,
				voucherCode
			}),
		{
			...queryConfig
		}
	)
}

export default useExportOrdersReport
