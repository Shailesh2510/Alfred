export const WHITE = '#FFFFFF'
export const TAB_ACTIVE_COLOR = '#0F3A82'
export const TAB_INACTIVE_COLOR = '#B4BCC9'
export const BLUE_700 = '#022867'
export const BLUE_300 = '#C4D5F1'
export const BLUE_150 = '#DFE9FA'

export const airportCoordinates: {
	[key: string]: { latitude: number; longitude: number }
} = {
	JFK: { latitude: 40.6413, longitude: -73.7781 },
	EWR: { latitude: 40.6895, longitude: -74.1745 },
	LGA: { latitude: 40.7769, longitude: -73.874 }
}

export const SCHEDULE_ORDER_DIFFERENCE_TIME_IN_MINUTES = 50
export const RIDE_DIFFERENCE_TIME_IN_MINUTES = 15
export const ORDER_STATUS_UPDATED_EVENT = 'ORDER_STATUS_UPDATED'
export const ORDER_CHANNEL = 'ORDERS'

export const EMAIL_VALIDATION_REGEX =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const PAYMENT_METHOD: any = {
	ROOM_CHARGE: { value: 'ROOM_CHARGE', label: 'Room Charge' },
	CREDIT_CARD: { value: 'CREDIT_CARD', label: 'Credit Card' }
}

export const ORDER_STATUS: any = {
	INITIATED: { value: 'INITIATED', label: 'Initiated' },
	SCHEDULED: { value: 'SCHEDULED', label: 'Scheduled' },
	PENDING: { value: 'PENDING', label: 'Pending' },
	CONFIRMED: { value: 'CONFIRMED', label: 'Confirmed' },
	PREPARATION: { value: 'PREPARATION', label: 'Preparation' },
	IN_DELIVERY: { value: 'IN_DELIVERY', label: 'In Delivery' },
	DELIVERED: { value: 'DELIVERED', label: 'Delivered' },
	CANCELED: { value: 'CANCELED', label: 'Canceled' }
}

export const DEFAULT_TIMEZONE = 'America/New_York'

export const VOUCHER_TYPES: any = {
	DISCOUNT: { value: 'DISCOUNT', label: 'DISCOUNT' },
	PER_DIEM: { value: 'PER_DIEM', label: 'PER DIEM' },
	PRE_FIXE: { value: 'PRE_FIXE', label: 'PRE FIXE' }
}

export const DISCOUNT_VOUCHER_TYPE: any = {
	FIXED: { value: 'FIXED', label: 'Fixed' },
	PERCENTAGE: { value: 'PERCENTAGE', label: 'Percentage' }
}

export const DEFAULT_RELAY_DELIVERY_FEE = 5.49
export const DEFAULT_IN_HOUSE_DELIVERY_FEE_AMOUNT_USD = 5.49

export const MERCHANT_TYPE_ROOM_SERVICE = 'ROOM_SERVICE'
export const MERCHANT_TYPE_RIDES = 'RIDES'
