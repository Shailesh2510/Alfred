import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useCanRelayDeliverToAddress = (
	hotelWebCode: any,
	merchantId: any,
	queryConfig = {}
) => {
	return useQuery(
		["canRelayDeliverToAddress", hotelWebCode, merchantId],
		() => API.getCanRelayDeliverToAddress(hotelWebCode, merchantId),
		{
			...queryConfig
		}
	)
}

export default useCanRelayDeliverToAddress
