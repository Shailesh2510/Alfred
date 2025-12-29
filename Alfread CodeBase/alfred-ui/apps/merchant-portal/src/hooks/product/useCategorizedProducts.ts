import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useCategorizedProducts = (queryConfig = {}) => {
	return useQuery(
		["categorized_products"],
		() => API.getCategorizedProducts(),
		{
			...queryConfig
		}
	)
}

export default useCategorizedProducts
