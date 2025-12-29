import { useQuery } from "@tanstack/react-query"
import { filterNullParams } from "@/shared-utils"
import API from "@/services/api"

const useCommissions = (params: any, queryConfig = {}) => {
	const filteredParams = filterNullParams(params)
	return useQuery(
		["commissions", filteredParams],
		() => API.getCommissions(filteredParams),
		{
			...queryConfig
		}
	)
}

export default useCommissions
