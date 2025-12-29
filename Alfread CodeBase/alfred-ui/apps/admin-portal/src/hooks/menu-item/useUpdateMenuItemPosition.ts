import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useUpdateMenuItemPosiiton = (queryConfig = {}) => {
	return useMutation(
		({ menuItemId, menuCategoryId, hotelId, orderPosition }: any) =>
			API.updateMenuItemPosition({
				menuItemId,
				menuCategoryId,
				hotelId,
				orderPosition
			}),
		{
			...queryConfig
		}
	)
}

export default useUpdateMenuItemPosiiton
