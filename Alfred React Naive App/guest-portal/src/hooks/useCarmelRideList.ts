import { useMutation } from '@tanstack/react-query'
import API from '../api/api'
import { RideListPayload } from '../types/ride-types'

type CarmelRideListPayload = {
	hotelId: string
	rideList: RideListPayload
}

const useCarmelRideList = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({ hotelId, rideList }: CarmelRideListPayload) =>
			API.getPriceList(hotelId, rideList),
		...queryConfig
	})
}

export default useCarmelRideList
