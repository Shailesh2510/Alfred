import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"
import { CreateOrderDTO } from "@/interfaces/createOrder"

const useCreateOrder = (queryConfig = {}) => {
	return useMutation(
		({
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
		{
			...queryConfig
		}
	)
}

export default useCreateOrder
