export type RideFormValues = {
	airport: string
	travelDate: Date | null
	travelTime: string
}

export const initialRideFormValues: RideFormValues = {
	airport: '',
	travelDate: null,
	travelTime: ''
}

export interface RideItem {
	id: string
	name: string
	cartItemId: string
	cartItemTime: Date
	baseFare: number
	serviceFee: number
	price: number
	carClassId: string
}

export interface PickUpAddress {
	streetName: string
	cityName: string
	streetNumber: string
	latitude: number
	longitude: number
	airport: boolean
}

export interface DropOffAddress {
	airport: boolean
	airportCode: string
	latitude: number
	longitude: number
}

export interface RideListPayload {
	addressFrom: PickUpAddress
	addressTo: DropOffAddress
	tripDate: string | null
	tripTime: string
}

export interface RideCheckoutFormValues {
	clientFirstName: string
	clientLastName: string
	clientNumber: string
	clientEmail: string
}

export interface TripUpdatePayload {
	nonce: string
	addressFrom: PickUpAddress
	addressTo: DropOffAddress
	tripDate: string | null
	tripTime: string
	customerFirstName: string
	customerLastName: string
	customerPhone: {
		countryCode: string
		number: string
	}
	emailAddr: string
	carClassID: string
	fareId: string
}

export interface Fare {
	parking: number
	displayTextList: Array<{ id: string; text: string }>
	fare: number
	fees: number
	congestionFee: number
	fareTypeCd: string
	gratuity: number
	taxExampt: boolean
	processingFeeOverride: boolean
	taxOverride: boolean
	tolls: number
	fareOverride: boolean
	commissionOverride: boolean
	expiresIn: number
	airportFee: number
	total: number
	fareId: string
	fuelOverride: boolean
	nysFundOverride: boolean
	discountOverride: boolean
	priceQuotesIncludes: string
	gratuityOverride: boolean
}

export interface RideOption {
	maxPassengers: number
	pictureUrl: string
	available: boolean
	carClassID: string
	driverGenderAvailableFemale: boolean
	maxLuggage: number
	carClassDesc: string
	maxWeelchairs: number
	fare: Fare
}

export interface AmbassadorCodePayload {
	ambassadorCode: string
	airportCode: string
	webCode: string
	code: string
}
