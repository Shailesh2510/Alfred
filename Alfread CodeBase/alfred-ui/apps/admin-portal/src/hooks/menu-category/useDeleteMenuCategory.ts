import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useDeleteMenuCategory = (queryConfig = {}) => {
	return useMutation(
		({ menuCategoryId }: any) => API.deleteMenuCategory({ menuCategoryId }),
		{
			...queryConfig
		}
	)
}

export default useDeleteMenuCategory
