import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

const usePaymentInit = (queryConfig = {}) => {
	return useMutation(
		({
			amount,
			orderId,
			paymentMethodType,
			clientName,
			clientNumber,
			clientEmail,
			isCateringOrder = false,
			isRideService = false
		}: any) =>
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
		{
			...queryConfig
		}
	)
}

export default usePaymentInit
