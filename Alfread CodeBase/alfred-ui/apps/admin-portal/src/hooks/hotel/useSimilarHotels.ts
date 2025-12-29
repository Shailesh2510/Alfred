import { useQuery } from "@tanstack/react-query"
import API from "@/services/api"

interface UseSimilarHotelsProps {
	hotelId?: string | string[]
	isEnabled?: boolean
	retry?: number
}

const useSimilarHotels = ({
	hotelId,
	isEnabled = true,
	...queryConfig
}: UseSimilarHotelsProps) => {
	return useQuery(
		["similar-hotels", hotelId],
		() =>
			API.getSimilarHotels({
				hotelId: Array.isArray(hotelId) ? hotelId[0] : hotelId
			}),
		{
			enabled: !!hotelId && isEnabled,
			...queryConfig
		}
	)
}
export default useSimilarHotels
