import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useEditUser = (queryConfig = {}) => {
	return useMutation(
		({ userId, userData }: any) => API.editUser({ userId, userData }),
		{
			...queryConfig
		}
	)
}

export default useEditUser
