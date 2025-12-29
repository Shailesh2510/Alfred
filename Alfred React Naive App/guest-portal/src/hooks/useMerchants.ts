import { useQuery } from '@tanstack/react-query'
import API from '../api/api'

const useMerchants = (webCode: string, queryConfig = {}) => {
	return useQuery({
		queryKey: ['merchants', webCode],
		queryFn: () => API.getMerchantsAssociatedToHotels(webCode),
		enabled: !!webCode,
		...queryConfig
	})
}

export default useMerchants
