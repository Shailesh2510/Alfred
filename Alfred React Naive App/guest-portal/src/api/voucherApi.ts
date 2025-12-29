import { axiosInstance } from './api'

export const getVoucher = async (voucherCode: string, hotelId: string) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/voucher/code/public/${voucherCode}/hotel/${hotelId}`
	)
	return data.data[0]
}

export const getReservationVoucher = async (
	webCode: string,
	lastName: string,
	roomNumber: string
) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/guest/${webCode}/${lastName}/${roomNumber}`
	)
	return data
}

export const refundVoucher = async (orderId: string) => {
	const { data } = await axiosInstance.put(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/order/public/refund-voucher/${orderId}`
	)
	return data
}
