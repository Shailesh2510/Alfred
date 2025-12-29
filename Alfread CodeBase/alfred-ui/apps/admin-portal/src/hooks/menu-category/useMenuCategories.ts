import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMenuCategories = ({ menuId }: any, queryConfig = {}) => {
	return useQuery(
		["menu_categories", menuId],
		() => API.getMenuCategories({ menuId }),
		{
			...queryConfig
		}
	)
}

export default useMenuCategories
