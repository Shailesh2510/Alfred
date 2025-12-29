import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useDeleteUser = (queryConfig = {}) => {
	return useMutation(({ userId }: any) => API.deleteUser({ userId }), {
		...queryConfig
	})
}

export default useDeleteUser
