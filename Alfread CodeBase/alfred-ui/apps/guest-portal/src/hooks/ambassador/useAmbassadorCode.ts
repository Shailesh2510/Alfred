import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const useAmbassadorCode = (queryConfig = {}) => {
	return useMutation(
		({
			ambassadorCode,
			airportCode,
			webCode
		}: {
			ambassadorCode: string
			airportCode: string
			webCode: string
		}) => API.getAmbassadorCode({ ambassadorCode, airportCode, webCode }),
		{
			...queryConfig
		}
	)
}

export default useAmbassadorCode
