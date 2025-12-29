import { CreateGuestDTO } from '../hooks/useConciergeService'
import { axiosInstance } from './api'

export const createGuest = async (guestData: CreateGuestDTO) => {
	const { data } = await axiosInstance.post(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/concierge/guest-request`,
		guestData
	)
	return data
}
