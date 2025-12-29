import { useQuery } from '@tanstack/react-query'
import API from '../api/api'

const useMenu = (hotelId: string, queryConfig = {}) => {
	return useQuery({
		queryKey: ['menu', hotelId],
		queryFn: () => API.getMenu(hotelId),
		...queryConfig
	})
}

export default useMenu
