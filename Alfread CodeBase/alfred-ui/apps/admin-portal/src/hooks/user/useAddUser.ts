import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAddUser = (queryConfig = {}) => {
	return useMutation(({ userData }: any) => API.addUser({ userData }), {
		...queryConfig
	})
}

export default useAddUser
