import { useMutation } from '@tanstack/react-query'
import API from '../api/api'
import { AmbassadorCodePayload } from '../types/ride-types'

const useAmbassadorCode = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({
			ambassadorCode,
			airportCode,
			webCode
		}: AmbassadorCodePayload) =>
			API.getAmbassadorCode({ ambassadorCode, airportCode, webCode }),
		...queryConfig
	})
}

export default useAmbassadorCode
