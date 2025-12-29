import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useUpdateMenuItemOrder = (queryConfig = {}) => {
	return useMutation(
		({ menuItemId, hotelId, newPrice }: any) =>
			API.updateMenuItemOrder({ menuItemId, hotelId, newPrice }),
		{
			...queryConfig
		}
	)
}

export default useUpdateMenuItemOrder
