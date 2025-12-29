/* eslint-disable no-unused-vars */
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export type RideFormValues = {
	airport: string
	travelDate: Date | null
	travelTime: string
	flightNumber: string
}

export type CheckoutFormValues = {
	clientFirstName: string
	clientLastName: string
	clientNumber: string
	clientEmail: string
}

export const initialRideFormValues: RideFormValues = {
	airport: "",
	travelDate: null,
	travelTime: "",
	flightNumber: ""
}

export const initialCheckoutFormValues: CheckoutFormValues = {
	clientFirstName: "",
	clientLastName: "",
	clientNumber: "",
	clientEmail: ""
}

interface PickUpAddress {
	streetName: string
	cityName: string
	streetNumber: string
	latitude: number
	longitude: number
	airport: boolean
}

interface DropOffAddress {
	airport: boolean
	airportCode: string
	latitude: number
	longitude: number
	flightNumber: string
}

const initialPickUpAddress: PickUpAddress = {
	streetName: "",
	cityName: "",
	streetNumber: "",
	latitude: 0,
	longitude: 0,
	airport: false
}
const initialDropOffAddress: DropOffAddress = {
	airport: false,
	airportCode: "",
	latitude: 0,
	longitude: 0,
	flightNumber: ""
}

interface RideItem {
	id: string
	name: string
	cartItemId: string
	cartItemTime: Date
	imageUrl: string
	baseFare: number
	serviceFee: number
	price: number
	carClassId: string
}

interface RideState {
	ride: {
		items: RideItem | null
		scheduledDate: string | null
		voucher: any | null
		comment: string
	}
	voucherCode: string
	rideOptions: any[]
	showCartModal: boolean
	carmelMerchantId: number
	rideForm: RideFormValues
	openChangeRideForm: boolean
	carmelMealPeriodId: number
	rideNonce: string
	orderId: number
	refetchRideList: boolean
	resetTimer: boolean
	timeValue: number
	rideScheduledTime: string
	currentHotelDetails: any | null
	pickUpAddress: PickUpAddress | DropOffAddress
	dropOffAddress: DropOffAddress | PickUpAddress
	openPaymentFailedModal: boolean
	rideType: string
	checkoutForm: CheckoutFormValues
	selectedAirportCode: string
}

interface RideActions {
	setRideScheduledDate: (scheduledDate: string | null) => void
	setRideScheduledTime: (rideScheduledTime: string) => void
	setRideVoucher: (voucher: any | null) => void
	setRideVoucherCode: (voucherCode: string) => void
	setShowCartModal: (showCartModal: boolean) => void
	setRideOptions: (rideOptions: any[]) => void
	addRide: (rideItem: any) => void
	setCarmelMerchantId: (carmelMerchantId: number) => void
	setRideFormValue: (rideForm: RideFormValues) => void
	setOpenChangeRideForm: (openChangeRideForm: boolean) => void
	setCarmelMealPeriodId: (carmelMealPeriodId: number) => void
	setRideNonce: (rideNonce: string, orderId: number) => void
	setRefetchRideList: (refetchRideList: boolean) => void
	setResetTimer: (resetTimer: boolean) => void
	setTimeValue: (timeValue: number) => void
	removeRide: () => void
	resetStore: () => void
	resetRideFormValue: () => void
	resetCheckoutFormValue: () => void
	setCurrentHotelDetails: (hotel: any) => void
	setPickUpAddress: (pickUpAddress: PickUpAddress | DropOffAddress) => void
	setDropOffAddress: (dropOffAddress: DropOffAddress | PickUpAddress) => void
	setOpenPaymentFailedModal: (openPaymentFailedModal: boolean) => void
	setRideType: (rideType: string) => void
	setCheckoutFormValue: (checkoutForm: CheckoutFormValues) => void
	setSelectedAirportCode: (selectedAirportCode: string) => void
}

// Initial State
const initialState: RideState = {
	ride: {
		items: null,
		scheduledDate: null,
		voucher: null,
		comment: ""
	},
	voucherCode: "",
	rideOptions: [],
	showCartModal: false,
	carmelMerchantId: 0,
	rideForm: initialRideFormValues,
	openChangeRideForm: false,
	carmelMealPeriodId: 0,
	rideNonce: "",
	orderId: 0,
	refetchRideList: false,
	resetTimer: false,
	timeValue: 0,
	rideScheduledTime: "",
	currentHotelDetails: null,
	dropOffAddress: initialDropOffAddress,
	pickUpAddress: initialPickUpAddress,
	openPaymentFailedModal: false,
	rideType: "DROPOFF",
	checkoutForm: initialCheckoutFormValues,
	selectedAirportCode: ""
}

const useRideStore = create<RideState & RideActions>()(
	devtools(set => ({
		...initialState,

		addRide: (rideItem: any) =>
			set(state => ({
				ride: { ...state.ride, items: rideItem }
			})),

		setOpenChangeRideForm: (openChangeRideForm: boolean) =>
			set({ openChangeRideForm }),

		setRideScheduledDate: (scheduledDate: string | null) =>
			set(state => ({
				ride: { ...state.ride, scheduledDate }
			})),

		setRideScheduledTime: (rideScheduledTime: string) =>
			set({ rideScheduledTime }),

		setRideVoucher: (voucher: any | null) =>
			set(state => ({
				ride: { ...state.ride, voucher }
			})),

		setCarmelMealPeriodId: (carmelMealPeriodId: number) =>
			set({ carmelMealPeriodId }),

		setRideFormValue: (rideForm: RideFormValues) => set({ rideForm }),

		setRideVoucherCode: (voucherCode: string) => set({ voucherCode }),

		setShowCartModal: (showCartModal: boolean) => set({ showCartModal }),

		setRideOptions: (rideOptions: any[]) =>
			set({
				rideOptions: rideOptions.filter((item: any) => {
					return item.carClassID !== "DX"
				})
			}),
		setCarmelMerchantId: (carmelMerchantId: number) =>
			set({ carmelMerchantId }),

		setRideNonce: (rideNonce: string, orderId: number) =>
			set({ rideNonce, orderId }),

		setCheckoutFormValue: (checkoutForm: CheckoutFormValues) =>
			set({ checkoutForm }),

		setRefetchRideList: (refetchRideList: boolean) => set({ refetchRideList }),

		setResetTimer: (resetTimer: boolean) => set({ resetTimer }),

		setDropOffAddress: (dropOffAddress: PickUpAddress | DropOffAddress) =>
			set({ dropOffAddress }),

		setPickUpAddress: (pickUpAddress: PickUpAddress | DropOffAddress) =>
			set({ pickUpAddress }),

		setTimeValue: (timeValue: number) => set({ timeValue }),
		setCurrentHotelDetails: (hotel: any) => set({ currentHotelDetails: hotel }),
		setOpenPaymentFailedModal: (openPaymentFailedModal: boolean) =>
			set({ openPaymentFailedModal }),

		setRideType: (rideType: string) => set({ rideType }),

		removeRide: () =>
			set(state => ({
				ride: { ...state.ride, items: null }
			})),

		resetRideFormValue: () =>
			set({ rideForm: { ...initialRideFormValues }, rideScheduledTime: "" }),
		resetCheckoutFormValue: () =>
			set({ checkoutForm: { ...initialCheckoutFormValues } }),
		setSelectedAirportCode: (selectedAirportCode: string) =>
			set({ selectedAirportCode }),
		resetStore: () => set(() => ({ ...initialState }))
	}))
)

export default useRideStore
