import { FetchMenuPayload } from '../types/menu-types/menu'
import { axiosInstance } from './api'

export const getMenu = async (hotelId: string) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_S3_BASE_URL}/alfredmenu-bucket-${hotelId}-menu`
	)
	return data
}

export const getMenuDetails = async (
	hotelId: string,
	merchantId: string,
	fetchMenuPayload: FetchMenuPayload
) => {
	const { data } = await axiosInstance.post(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/menu/${hotelId}/${merchantId}`,
		{ ...fetchMenuPayload }
	)
	return data.data[0]
}
