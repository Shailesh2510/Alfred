import { useMutation } from '@tanstack/react-query'
import API from '../api/api'
import { TripUpdatePayload } from '../types/ride-types'

type CreateTripPayload = {
	hotelId: string
	createTrip: TripUpdatePayload
}

const useCreateTrip = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({ hotelId, createTrip }: CreateTripPayload) =>
			API.createTrip(hotelId, createTrip),
		...queryConfig
	})
}

export default useCreateTrip
