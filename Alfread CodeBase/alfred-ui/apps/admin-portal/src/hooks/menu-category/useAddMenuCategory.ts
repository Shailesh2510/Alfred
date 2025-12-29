import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAddMenuCategory = (queryConfig = {}) => {
	return useMutation(
		({ hotelId, mealPeriodId, menuId, name }: any) =>
			API.addMenuCategory({ hotelId, mealPeriodId, menuId, name }),
		{
			...queryConfig
		}
	)
}

export default useAddMenuCategory
