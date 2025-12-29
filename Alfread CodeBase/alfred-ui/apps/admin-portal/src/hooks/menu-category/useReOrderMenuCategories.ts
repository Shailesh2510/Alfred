import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useReOrderMenuCategories = (queryConfig = {}) => {
	return useMutation(
		({ categories }: any) => API.reOrderMenuCategories({ categories }),
		{
			...queryConfig
		}
	)
}

export default useReOrderMenuCategories
