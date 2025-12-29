import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAssignItemsToCategory = (queryConfig = {}) => {
	return useMutation(
		({ hotelId, itemIds, menuId, menuCategoryId }: any) =>
			API.assignItemsToCategory({ hotelId, itemIds, menuId, menuCategoryId }),
		{
			...queryConfig
		}
	)
}

export default useAssignItemsToCategory
