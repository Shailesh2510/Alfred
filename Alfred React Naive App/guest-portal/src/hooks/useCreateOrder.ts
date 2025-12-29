import { useMutation } from '@tanstack/react-query'
import { CreateOrderDTO } from '../types/order-types/createOrder'
import API from '../api/api'

const useCreateOrder = (queryConfig = {}) => {
	return useMutation({
		mutationFn: ({
			tip,
			items,
			comment,
			hotelId,
			orderType,
			clientName,
			roomNumber,
			clientEmail,
			mealPeriodId,
			clientNumber,
			voucherCodeId,
			scheduledDate,
			numberOfCutleries,
			hasAlcohol,
			isCatering,
			merchantId,
			rideGrandTotal,
			referralId
		}: CreateOrderDTO) =>
			API.createOrder({
				tip,
				items,
				comment,
				hotelId,
				orderType,
				clientName,
				roomNumber,
				clientEmail,
				mealPeriodId,
				clientNumber,
				voucherCodeId,
				scheduledDate,
				numberOfCutleries,
				hasAlcohol,
				isCatering,
				merchantId,
				rideGrandTotal,
				referralId
			}),
		...queryConfig
	})
}

export default useCreateOrder
