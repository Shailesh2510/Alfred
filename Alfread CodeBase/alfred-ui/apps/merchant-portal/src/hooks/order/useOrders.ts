import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useOrders = (
	{ page, fromDate, status, toDate, hotelId, roomNumber }: any,
	queryConfig = {}
) => {
	return useQuery(
		["orders", page, fromDate, status, toDate, hotelId, roomNumber],
		() =>
			API.getOrders({ page, fromDate, status, toDate, hotelId, roomNumber }),
		{
			...queryConfig
		}
	)
}

export default useOrders
