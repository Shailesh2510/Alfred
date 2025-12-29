import { useMutation } from '@tanstack/react-query'
import API from '../api/api'

type fetchDeliveryFee = { hotelId: string; merchantId: number }

const useDeliveryFee = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({ hotelId, merchantId }: fetchDeliveryFee) =>
			API.getShipdayDeliveryFees(hotelId, merchantId),
		...queryConfig
	})
}

export default useDeliveryFee
