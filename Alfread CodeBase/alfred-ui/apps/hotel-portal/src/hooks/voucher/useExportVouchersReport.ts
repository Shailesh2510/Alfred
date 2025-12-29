import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useExportVouchersReport = (queryConfig = {}) => {
	return useMutation(
		({ page, claimed, code, voucherProgramId }: any) =>
			API.exportVouchersReport({ page, claimed, code, voucherProgramId }),
		{
			...queryConfig
		}
	)
}

export default useExportVouchersReport
