export interface Hotel {
	_id: string
	id: number
	name: string
	addressNumber: string
	addressTown: string
	addressStreet: string
	addressZipCode: string
	code: string
	webCode: string
	allowCreditCard: boolean
	allowRoomCharge: boolean
	isTaxExempt: boolean
	cityId: string
	menuId: string
	cityName: string
	isActive: boolean
	hasCutlery: boolean
	deliveryFee: number
	gxPhoneNumber: string
	timezone: string
	hasDeliveryFee: boolean
	enableAutomaticTip: boolean
	coordinates: {
		x: number
		y: number
	}
}
