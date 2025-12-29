import { useMutation } from '@tanstack/react-query'
import API from '../api/api'

export interface CreateGuestDTO {
	firstName: string
	lastName: string
	phoneNumber: string
	hotelId: string
	roomNumber: string
}

const useConciergeService = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({
			firstName,
			lastName,
			phoneNumber,
			hotelId,
			roomNumber
		}: CreateGuestDTO) =>
			API.createGuest({
				firstName,
				lastName,
				phoneNumber,
				hotelId,
				roomNumber
			}),
		...queryConfig
	})
}

export default useConciergeService
