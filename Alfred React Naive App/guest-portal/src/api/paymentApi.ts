import { PaymentInitPayload } from '@hooks/usePaymentInit'
import { axiosInstance } from './api'

export const paymentInit = async (paymentData: PaymentInitPayload) => {
	const { data } = await axiosInstance.post(
		`${process.env.EXPO_PUBLIC_API_BASE_URL}/payment/init`,
		paymentData
	)
	return data
}
