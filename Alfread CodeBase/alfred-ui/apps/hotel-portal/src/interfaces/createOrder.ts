export interface CreateOrderItemModifierOptionDTO {
	id: number
	quantity: number
}

export interface CreateOrderItemModifierDTO {
	id: number
	options: CreateOrderItemModifierOptionDTO[]
}

export interface CreateOrderItemDTO {
	id: number
	voucherCodeId?: number
	quantity: number
	modifiers: CreateOrderItemModifierDTO[]
}

export interface CreateOrderDTO {
	clientName: string
	clientNumber: string
	clientEmail?: string
	orderType: string | null
	mealPeriodId: number
	voucherCodeId?: number
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
	referralId?: number
}
