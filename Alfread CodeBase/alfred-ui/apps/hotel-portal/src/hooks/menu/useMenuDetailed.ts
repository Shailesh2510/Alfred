import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMenuDetailed = (queryConfig = {}) => {
	return useQuery(["menu"], () => API.getMenuDetailed(), {
		...queryConfig
	})
}

export default useMenuDetailed
