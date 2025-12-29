/* eslint-disable no-unused-vars */
import { create } from 'zustand'
import {
	PickUpAddress,
	DropOffAddress,
	RideItem,
	RideFormValues,
	initialRideFormValues
} from '../types/ride-types'

const initialPickUpAddress: PickUpAddress = {
	streetName: '',
	cityName: '',
	streetNumber: '',
	latitude: 0,
	longitude: 0,
	airport: false
}
const initialDropOffAddress: DropOffAddress = {
	airport: false,
	airportCode: '',
	latitude: 0,
	longitude: 0
}

interface RideState {
	clientFirstName: string
	clientLastName: string
	clientNumber: string
	clientEmail: string
	rideScheduledDate: string | null
	selectedRide: RideItem | null
	voucherCode: string
	rideOptions: any[]
	showCartModal: boolean
	rideForm: RideFormValues
	openChangeRideForm: boolean
	rideNonce: string
	orderId: number
	refetchRideList: boolean
	resetTimer: boolean
	timeValue: number
	rideScheduledTime: string
	pickUpAddress: PickUpAddress
	dropOffAddress: DropOffAddress
	ambassadorCode: string
	ambassadorDetails: any | null
}

interface RideActions {
	setRideClientFirstName: (clientFirstName: string) => void
	setRideClientLastName: (clientLastName: string) => void
	setRideClientNumber: (clientNumber: string) => void
	setRideClientEmail: (clientEmail: string) => void
	setRideScheduledDate: (scheduledDate: string | null) => void
	setRideScheduledTime: (rideScheduledTime: string) => void
	setRideVoucherCode: (voucherCode: string) => void
	setShowCartModal: (showCartModal: boolean) => void
	setRideOptions: (rideOptions: any[]) => void
	addRide: (rideItem: any) => void
	setRideFormValue: (rideForm: RideFormValues) => void
	setOpenChangeRideForm: (openChangeRideForm: boolean) => void
	setRideNonce: (rideNonce: string, orderId: number) => void
	setRefetchRideList: (refetchRideList: boolean) => void
	setResetTimer: (resetTimer: boolean) => void
	setTimeValue: (timeValue: number) => void
	setPickUpAddress: (pickUpAddress: PickUpAddress) => void
	setDropOffAddress: (dropOffAddress: DropOffAddress) => void
	removeRide: () => void
	resetStore: () => void
	setAmbassadorCode: (code: string) => void
	setAmbassadorDetails: (details: any | null) => void
}

// Initial State
const initialState: RideState = {
	clientFirstName: '',
	clientLastName: '',
	clientNumber: '',
	clientEmail: '',
	rideScheduledDate: null,
	selectedRide: null,
	voucherCode: '',
	rideOptions: [],
	showCartModal: false,
	rideForm: initialRideFormValues,
	openChangeRideForm: false,
	rideNonce: '',
	orderId: 0,
	refetchRideList: false,
	resetTimer: false,
	timeValue: 0,
	rideScheduledTime: '',
	dropOffAddress: initialDropOffAddress,
	pickUpAddress: initialPickUpAddress,
	ambassadorCode: '',
	ambassadorDetails: []
}

export const useRideStore = create<RideState & RideActions>(set => ({
	...initialState,

	setRideClientFirstName: (clientFirstName: string) => set({ clientFirstName }),
	setRideClientLastName: (clientLastName: string) => set({ clientLastName }),

	setRideClientNumber: (clientNumber: string) => set({ clientNumber }),

	setRideClientEmail: (clientEmail: string) => set({ clientEmail }),

	addRide: (rideItem: RideItem) => set({ selectedRide: rideItem }),

	setOpenChangeRideForm: (openChangeRideForm: boolean) =>
		set({ openChangeRideForm }),

	setRideScheduledDate: (rideScheduledDate: string | null) =>
		set({ rideScheduledDate }),

	setRideScheduledTime: (rideScheduledTime: string) =>
		set({ rideScheduledTime }),

	setDropOffAddress: (dropOffAddress: DropOffAddress) =>
		set({ dropOffAddress }),

	setPickUpAddress: (pickUpAddress: PickUpAddress) => set({ pickUpAddress }),

	setRideFormValue: (rideForm: RideFormValues) => set({ rideForm }),

	setRideVoucherCode: (voucherCode: string) => set({ voucherCode }),

	setShowCartModal: (showCartModal: boolean) => set({ showCartModal }),

	setRideOptions: (rideOptions: any[]) =>
		set({
			rideOptions: rideOptions.filter((item: any) => {
				return item.carClassID !== 'DX'
			})
		}),

	setRideNonce: (rideNonce: string, orderId: number) =>
		set({ rideNonce, orderId }),

	setRefetchRideList: (refetchRideList: boolean) => set({ refetchRideList }),

	setResetTimer: (resetTimer: boolean) => set({ resetTimer }),

	setTimeValue: (timeValue: number) => set({ timeValue }),
	removeRide: () => set({ selectedRide: null }),

	setAmbassadorCode: (ambassadorCode: string) => set({ ambassadorCode }),
	setAmbassadorDetails: (ambassadorDetails: any | null) =>
		set({ ambassadorDetails }),

	resetStore: () => set(() => ({ ...initialState }))
}))
