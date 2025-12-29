import { axiosInstance } from './api'

export const getHotels = async (webCode: string) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/hotel/public/hotel-details/${webCode}`
	)
	return data.data[0]
}

export const getMerchantsAssociatedToHotels = async (webCode: string) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/hotel/public/get-merchants/${webCode}`
	)
	return data.data
}
