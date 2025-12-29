import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useUsers = (queryConfig = {}) => {
	return useQuery(["users"], () => API.getUsers(), {
		...queryConfig
	})
}

export default useUsers
