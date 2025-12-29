import { useQuery } from '@tanstack/react-query'
import API from '../api/api'

const useHotels = (webCode: string, queryConfig = {}) => {
	return useQuery({
		queryKey: ['hotels', webCode],
		queryFn: () => API.getHotels(webCode),
		enabled: !!webCode,
		...queryConfig
	})
}

export default useHotels
