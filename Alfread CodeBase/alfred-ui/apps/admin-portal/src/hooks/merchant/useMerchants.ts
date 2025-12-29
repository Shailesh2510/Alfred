import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMerchants = (
	hotelId: string | undefined = undefined,
	queryConfig = {}
) => {
	return useQuery(["merchants", hotelId], () => API.getMerchants({ hotelId }), {
		...queryConfig
	})
}

export default useMerchants
