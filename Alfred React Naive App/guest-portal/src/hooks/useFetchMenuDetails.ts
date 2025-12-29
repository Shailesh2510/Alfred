import { useMutation } from '@tanstack/react-query'
import API from '../api/api'
import { FetchMenuPayload } from '../types/menu-types/menu'

const useFetchMenuDetails = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({
			hotelId,
			merchantId,
			fetchMenuPayload
		}: {
			hotelId: string
			merchantId: string
			fetchMenuPayload: FetchMenuPayload
		}) => API.getMenuDetails(hotelId, merchantId, fetchMenuPayload),
		...queryConfig
	})
}

export default useFetchMenuDetails
