/* eslint-disable no-unused-vars */
import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface State {
	currentHotelDetails: any | null
	featureFlags: Record<string, any>
	showCheckoutPage: boolean
	showPaymentPage: boolean
	showMerchantSelectionPage: boolean
}

interface Actions {
	setCurrentHotelDetails: (hotel: any) => void
	setFeatureFlags: (flags: Record<string, any>) => void
	setShowCheckoutPage: (showCheckoutPage: boolean) => void
	setShowPaymentPage: (showPaymentPage: boolean) => void
	setShowMerchantSelectionPage: (show: boolean) => void
}

const initialState: State = {
	currentHotelDetails: null,
	featureFlags: {},
	showCheckoutPage: false,
	showPaymentPage: false,
	showMerchantSelectionPage: false
}

const useGlobalStore = create<State & Actions>()(
	devtools(set => ({
		...initialState,

		setCurrentHotelDetails: (hotel: any) => set({ currentHotelDetails: hotel }),
		setFeatureFlags: flags => set({ featureFlags: flags }),
		setShowCheckoutPage: (showCheckoutPage: boolean) =>
			set({ showCheckoutPage }),
		setShowPaymentPage: (showPaymentPage: boolean) => set({ showPaymentPage }),
		setShowMerchantSelectionPage: (show: boolean) =>
			set({ showMerchantSelectionPage: show })
	}))
)

export default useGlobalStore
