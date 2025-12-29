import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useRoles = (queryConfig = {}) => {
	return useQuery(["roles"], () => API.getRoles(), {
		...queryConfig
	})
}

export default useRoles
