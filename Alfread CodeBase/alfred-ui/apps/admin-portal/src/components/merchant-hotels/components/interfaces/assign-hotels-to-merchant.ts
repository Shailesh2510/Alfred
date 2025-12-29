export interface HotelMealPeriodAssignment {
	hotelId: number
	mealPeriodIds: number[]
}

export interface AssignHotelsWithMealPeriodsToMerchant {
	merchantId: number
	hotelMealPeriodMappings: HotelMealPeriodAssignment[]
}

export interface Hotel {
	id: number
	name: string
}

export interface MealPeriod {
	id: number
	name: string
}

export interface HotelStatus {
	active: boolean
	[key: string]: boolean
}
