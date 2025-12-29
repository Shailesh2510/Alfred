import API from "@/services/api"
import { useMutation } from "@tanstack/react-query"

const useEditPassword = (queryConfig = {}) => {
	return useMutation(
		({ userId, password, permanent }: any) =>
			API.editPassword({ userId, password, permanent }),
		{
			...queryConfig
		}
	)
}

export default useEditPassword
