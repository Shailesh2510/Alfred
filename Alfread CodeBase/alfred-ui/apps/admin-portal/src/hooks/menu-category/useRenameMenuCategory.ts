import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useRenameMenuCategory = (queryConfig = {}) => {
	return useMutation(
		({ menuCategoryId, hotelId, name }: any) =>
			API.renameMenuCategory({ menuCategoryId, hotelId, name }),
		{
			...queryConfig
		}
	)
}

export default useRenameMenuCategory
