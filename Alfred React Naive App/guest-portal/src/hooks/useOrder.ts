import { useQuery } from '@tanstack/react-query'
import API from '../api/api'

const useOrder = (orderId: string, queryConfig = {}) => {
	return useQuery({
		queryKey: ['order', orderId],
		queryFn: () => API.getOrder(orderId),
		...queryConfig
	})
}

export default useOrder
