import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useDeleteMenuItem = (queryConfig = {}) => {
	return useMutation(
		({ menuItemId, hotelId, newPrice }: any) =>
			API.deleteMenuItem({ menuItemId, hotelId, newPrice }),
		{
			...queryConfig
		}
	)
}

export default useDeleteMenuItem
