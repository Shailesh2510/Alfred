import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useDeliveryFee = (queryConfig = {}) => {
	return useMutation(
		({ hotelId, merchantId }: any) =>
			API.getShipdayDeliveryFees(hotelId, merchantId),
		{
			...queryConfig
		}
	)
}

export default useDeliveryFee
