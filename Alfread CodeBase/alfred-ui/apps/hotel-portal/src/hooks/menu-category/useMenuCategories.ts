import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMenuCategories = (queryConfig = {}) => {
	return useQuery(["menu_categories"], () => API.getMenuCategories(), {
		...queryConfig
	})
}

export default useMenuCategories
