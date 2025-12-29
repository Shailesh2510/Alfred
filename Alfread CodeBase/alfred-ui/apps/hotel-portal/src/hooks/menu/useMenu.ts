import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMenu = ({ hotelId }: any, queryConfig = {}) => {
	return useQuery(["menu", hotelId], () => API.getMenu({ hotelId }), {
		...queryConfig
	})
}

export default useMenu
