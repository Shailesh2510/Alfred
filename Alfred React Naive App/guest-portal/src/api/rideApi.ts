import { RideListPayload, TripUpdatePayload } from '../types/ride-types'
import { axiosInstance } from './api'

export const getPriceList = async (
	webCode: string,
	priceList: RideListPayload
) => {
	const { data } = await axiosInstance.post(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/carmel/get-price-list/${webCode}`,
		priceList
	)
	return data
}

export const createTrip = async (
	webCode: string,
	createTrip: TripUpdatePayload
) => {
	const { data } = await axiosInstance.post(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/carmel/post-trip/${webCode}`,
		createTrip
	)
	return data.data
}
