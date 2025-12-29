import { useMutation } from '@tanstack/react-query'
import API from '../api/api'

const useCanRelayDeliverToAddress = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({
			hotelWebCode,
			merchantId
		}: {
			hotelWebCode: string
			merchantId: number
		}) => API.getCanRelayDeliverToAddress(hotelWebCode, merchantId),
		...queryConfig
	})
}

export default useCanRelayDeliverToAddress
