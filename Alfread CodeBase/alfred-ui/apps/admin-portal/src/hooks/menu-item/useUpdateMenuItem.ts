import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useUpdateMenuItem = (queryConfig = {}) => {
	return useMutation(
		({ menuItemId, hotelId, newPrice }: any) =>
			API.updateMenuItem({ menuItemId, hotelId, newPrice }),
		{
			...queryConfig
		}
	)
}

export default useUpdateMenuItem
