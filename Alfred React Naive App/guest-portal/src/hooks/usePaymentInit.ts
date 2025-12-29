import { useMutation } from '@tanstack/react-query'
import API from '../api/api'

export type PaymentInitPayload = {
	amount: number
	orderId: string
	paymentMethodType: string
	clientName: string
	clientNumber: string
	clientEmail: string
	isCateringOrder?: boolean
	isRideService?: boolean
}

const usePaymentInit = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({
			amount,
			orderId,
			paymentMethodType,
			clientName,
			clientNumber,
			clientEmail,
			isCateringOrder = false,
			isRideService = false
		}: PaymentInitPayload) =>
			API.paymentInit({
				amount,
				orderId,
				clientName,
				clientNumber,
				clientEmail,
				paymentMethodType,
				isCateringOrder,
				isRideService
			}),
		...queryConfig
	})
}

export default usePaymentInit
