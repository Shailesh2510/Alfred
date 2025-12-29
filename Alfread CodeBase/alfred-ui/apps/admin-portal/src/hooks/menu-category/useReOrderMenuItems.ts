import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useReOrderMenuItems = (queryConfig = {}) => {
	return useMutation(
		({ menuItems }: any) => API.reOrderMenuItems({ menuItems }),
		{
			...queryConfig
		}
	)
}

export default useReOrderMenuItems
