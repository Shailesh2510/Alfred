import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useUser = ({ userId }: any, queryConfig = {}) => {
	return useQuery(["user", userId], () => API.getUser({ userId }), {
		...queryConfig
	})
}

export default useUser
