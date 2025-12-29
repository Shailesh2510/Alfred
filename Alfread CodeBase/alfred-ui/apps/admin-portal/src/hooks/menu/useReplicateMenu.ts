import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"
const useReplicateMenu = (queryConfig = {}) => {
	return useMutation(
		([sourceHotelId, targetHotelIds, merchantIds]: [
			number,
			number[],
			number[]
		]) =>
			API.replicateMenusToHotels(sourceHotelId, targetHotelIds, merchantIds),
		{
			...queryConfig
		}
	)
}
export default useReplicateMenu
