import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

const useMealPeriods = (queryConfig = {}) => {
	return useQuery(["meal_periods"], () => API.getMealPeriods(), {
		...queryConfig
	})
}

export default useMealPeriods
