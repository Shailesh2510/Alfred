import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"
import { filterNullParams } from "@/shared-utils"

const useOrders = (params: any, queryConfig = {}) => {
	const filteredParams = filterNullParams(params)
	return useQuery(
		["kds-orders", params.hotelId, params.page, params.merchantId],
		() => API.getKdsOrders(filteredParams),
		{
			...queryConfig
		}
	)
}

export default useOrders
