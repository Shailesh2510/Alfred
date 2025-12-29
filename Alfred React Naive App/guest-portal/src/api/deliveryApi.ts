import { axiosInstance } from './api'

export const getShipdayDeliveryFees = async (
	hotelId: string,
	merchantId: number
) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/shipday/get-delivery-fees/${hotelId}/${merchantId}`
	)
	return data.data[0]
}

export const getCanRelayDeliverToAddress = async (
	hotelWebCode: string,
	merchantId: number
) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/relay/quote?hotelWebCode=${hotelWebCode}&merchantId=${merchantId}`
	)

	return data.data[0]
}
