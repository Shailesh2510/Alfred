import { OrderCancelPayload } from '../types/order-types/cancelOrder'
import { CreateOrderDTO } from '../types/order-types/createOrder'
import { axiosInstance } from './api'

export const getOrder = async (orderId: string) => {
	const { data } = await axiosInstance.get(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/order/public/${orderId}`
	)
	return data
}

export const createOrder = async (orderData: CreateOrderDTO) => {
	const { data } = await axiosInstance.post(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/gateway/order/public/create-order`,
		{
			...orderData
		}
	)
	return data
}

export const cancelOrder = async (
	orderId: string,
	orderCancelPayload: OrderCancelPayload
) => {
	const { data } = await axiosInstance.post(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/cancel/order/${orderId}`,
		{
			...orderCancelPayload
		}
	)
	return data
}
