import { useMutation } from "@tanstack/react-query"
import API from "@/services/api"

interface CreateOrderItemModifierOptionDTO {
	id: number
	quantity: number
}

interface CreateOrderItemModifierDTO {
	id: number
	options: CreateOrderItemModifierOptionDTO[]
}

interface CreateOrderItemDTO {
	id: number
	voucherCodeId?: number
	quantity: number
	modifiers: CreateOrderItemModifierDTO[]
}

interface CreateOrderDTO {
	clientName: string
	clientNumber: string
	clientEmail?: string
	orderType: string | null
	mealPeriodId: number
	voucherCodeId?: number
	referralId?: number
	rideGrandTotal?: number
	hotelId: number
	merchantId?: number
	scheduledDate?: string | null
	comment?: string
	roomNumber?: string
	tip: string
	numberOfCutleries?: string
	hasAlcohol?: boolean
	isCatering?: boolean
	items?: CreateOrderItemDTO[] | []
	timezone?: string
}

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
