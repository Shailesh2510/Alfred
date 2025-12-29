/* eslint-disable no-unused-vars */
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export type RideFormValues = {
	airport: string
	travelDate: Date | null
	travelTime: string
}

export const initialRideFormValues: RideFormValues = {
	airport: "",
	travelDate: null,
	travelTime: ""
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
	longitude: 0
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
}

interface RideState {
	ride: {
		items: RideItem | null
		clientFirstName: string
		clientLastName: string
		clientNumber: string
		clientEmail: string
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
	pickUpAddress: PickUpAddress
	dropOffAddress: DropOffAddress
}

interface RideActions {
	setRideClientFirstName: (clientFirstName: string) => void
	setRideClientLastName: (clientLastName: string) => void
	setRideClientNumber: (clientNumber: string) => void
	setRideClientEmail: (clientEmail: string) => void
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
	setPickUpAddress: (pickUpAddress: PickUpAddress) => void
	setDropOffAddress: (dropOffAddress: DropOffAddress) => void
	removeRide: () => void
	resetStore: () => void
}

// Initial State
const initialState: RideState = {
	ride: {
		items: null,
		clientFirstName: "",
		clientLastName: "",
		clientNumber: "",
		clientEmail: "",
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
	dropOffAddress: initialDropOffAddress,
	pickUpAddress: initialPickUpAddress
}

const useRideStore = create<RideState & RideActions>()(
	devtools(set => ({
		...initialState,

		setRideClientFirstName: (clientFirstName: string) =>
			set(state => ({
				ride: { ...state.ride, clientFirstName }
			})),
		setRideClientLastName: (clientLastName: string) =>
			set(state => ({
				ride: { ...state.ride, clientLastName }
			})),

		setRideClientNumber: (clientNumber: string) =>
			set(state => ({
				ride: { ...state.ride, clientNumber }
			})),

		addRide: (rideItem: any) =>
			set(state => ({
				ride: { ...state.ride, items: rideItem }
			})),

		setOpenChangeRideForm: (openChangeRideForm: boolean) =>
			set({ openChangeRideForm }),

		setRideClientEmail: (clientEmail: string) =>
			set(state => ({
				ride: { ...state.ride, clientEmail }
			})),

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

		setDropOffAddress: (dropOffAddress: DropOffAddress) =>
			set({ dropOffAddress }),

		setPickUpAddress: (pickUpAddress: PickUpAddress) => set({ pickUpAddress }),

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

		setRefetchRideList: (refetchRideList: boolean) => set({ refetchRideList }),

		setResetTimer: (resetTimer: boolean) => set({ resetTimer }),

		setTimeValue: (timeValue: number) => set({ timeValue }),
		removeRide: () =>
			set(state => ({
				ride: { ...state.ride, items: null }
			})),

		resetStore: () => set(() => ({ ...initialState }))
	}))
)

export default useRideStore
