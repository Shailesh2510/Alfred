import { create } from 'zustand'
import API from '../api/api'
import { Hotel } from '../types/hotel-types/hotel'
import { Coordinates, Merchant } from '../types/merchant-types/merchants'
import { router } from 'expo-router'

interface GlobalState {
	currentHotelDetails: Hotel | null
	selectedMerchantCoordinates: Coordinates
	selectedMerchantId: string
	merchantDetails: Array<Merchant>
	currentHotelId: string
	showLoadingScreen: boolean
	openSideBar: boolean
	phoneModalVisible: boolean
	noMenuModalVisible: boolean
	isUserScrolling: boolean
	carmelMealPeriodId: number
	carmelMerchantId: number
	schedulerModalVisible: boolean
	refetchMenuItems: boolean
	paymentPending: boolean
	showPaymentInProgressModal: boolean
}

interface GlobalActions {
	setSchedulerModalVisible: (schedulerModalVisible: boolean) => void
	setRefetchMenuItems: (refetchMenuItems: boolean) => void
	setCurrentHotelDetails: (hotelId: any) => void
	setSelectedMerchantCoordinates: (coordinates: any) => void
	setMerchantDetails: (merchantDetails: any) => void
	setCurrentHotelId: (currentHotelId: string) => void
	setShowLoadingScreen: (showLoadingScreen: boolean) => void
	setOpenSideBar: (openSideBar: boolean) => void
	setPhoneModalVisible: (phoneModalVisible: boolean) => void
	setNoMenuModalVisible: (noMenuModalVisible: boolean) => void
	setIsUserScrolling: (isUserScrolling: boolean) => void
	setCarmelMealPeriodId: (carmelMealPeriodId: number) => void
	setCarmelMerchantId: (carmelMerchantId: number) => void
	setSelectedMerchantId: (selectedMerchantId: string) => void
	setPaymentPending: (paymentPending: boolean) => void
	setShowPaymentInProgressModal: (showPaymentInProgressModal: boolean) => void
	setCurrentHotelAndMerchant: (hotelId: string, merchantId: string) => void
}

const initialState: GlobalState = {
	currentHotelDetails: null,
	selectedMerchantCoordinates: { x: 0, y: 0 },
	selectedMerchantId: '',
	merchantDetails: [],
	currentHotelId: '',
	showLoadingScreen: true,
	openSideBar: false,
	phoneModalVisible: false,
	noMenuModalVisible: false,
	isUserScrolling: false,
	carmelMealPeriodId: 0,
	carmelMerchantId: 0,
	schedulerModalVisible: false,
	refetchMenuItems: false,
	paymentPending: false,
	showPaymentInProgressModal: false
}

export const useGlobalStore = create<GlobalState & GlobalActions>(
	(set, get) => ({
		...initialState,
		setIsUserScrolling: (isUserScrolling: boolean) => set({ isUserScrolling }),
		setOpenSideBar: (openSideBar: boolean) => set({ openSideBar }),
		setPhoneModalVisible: (phoneModalVisible: boolean) =>
			set({ phoneModalVisible }),
		setNoMenuModalVisible: (noMenuModalVisible: boolean) =>
			set({ noMenuModalVisible }),
		setSchedulerModalVisible: (schedulerModalVisible: boolean) =>
			set({ schedulerModalVisible }),
		setRefetchMenuItems: (refetchMenuItems: boolean) =>
			set({ refetchMenuItems }),
		setShowPaymentInProgressModal: (showPaymentInProgressModal: boolean) =>
			set({ showPaymentInProgressModal }),
		setSelectedMerchantCoordinates: (coordinates: any) =>
			set({ selectedMerchantCoordinates: coordinates }),
		setSelectedMerchantId: (merchantId: string) =>
			set({ selectedMerchantId: merchantId }),
		setPaymentPending: (paymentPending: boolean) => set({ paymentPending }),
		setMerchantDetails: (merchantDetails: any) => set({ merchantDetails }),
		setShowLoadingScreen: (showLoadingScreen: boolean) =>
			set({ showLoadingScreen }),
		setCarmelMealPeriodId: (carmelMealPeriodId: number) =>
			set({ carmelMealPeriodId }),
		setCarmelMerchantId: (carmelMerchantId: number) =>
			set({ carmelMerchantId }),
		setCurrentHotelId: async (hotelId: string) => {
			if (hotelId !== get().currentHotelId) {
				set({ currentHotelId: hotelId })
				try {
					set({ showLoadingScreen: true })
					const hotels = await API.getHotels(hotelId)
					if (hotels) {
						set({
							currentHotelDetails: hotels
						})
						const merchants = await API.getMerchantsAssociatedToHotels(hotelId)
						set({
							merchantDetails: merchants?.filter((m: any) => !m.allow_catering)
						})
						const rideMerchant = merchants?.find(
							(m: Merchant) => m.merchant_type === 'RIDES'
						)

						if (rideMerchant) {
							set({ carmelMerchantId: rideMerchant.id })
							set({ carmelMealPeriodId: rideMerchant.meal_period_ids[0] })
						}
					}
				} catch (error) {
					console.error('Error initializing store:', error)
				} finally {
					set({ showLoadingScreen: false })
					router.replace(`/${hotelId}`)
				}
			}
		},
		setCurrentHotelDetails: async (hotelId: string) => {
			if (hotelId !== get().currentHotelId) {
				set({ currentHotelId: hotelId })
				try {
					set({ showLoadingScreen: true })
					const hotels = await API.getHotels(hotelId)

					if (hotels) {
						set({
							currentHotelDetails: hotels
						})

						const merchants = await API.getMerchantsAssociatedToHotels(hotelId)
						set({
							merchantDetails: merchants?.filter((m: any) => !m.allow_catering)
						})
						const rideMerchant = merchants?.find(
							(m: Merchant) => m.merchant_type === 'RIDES'
						)

						if (rideMerchant) {
							set({ carmelMerchantId: rideMerchant.id })
							set({ carmelMealPeriodId: rideMerchant.meal_period_ids[0] })
						}
					}
				} catch (error) {
					console.error('Error initializing store:', error)
				} finally {
					set({ showLoadingScreen: false })
				}
			}
		},
		setCurrentHotelAndMerchant: async (hotelId: string, merchantId: string) => {
			if (hotelId !== get().currentHotelId) {
				set({ currentHotelId: hotelId })
				try {
					set({ showLoadingScreen: true })
					const hotels = await API.getHotels(hotelId)

					if (hotels) {
						set({
							currentHotelDetails: hotels
						})

						const merchants = await API.getMerchantsAssociatedToHotels(hotelId)
						set({
							merchantDetails: merchants?.filter((m: any) => !m.allow_catering)
						})
						const rideMerchant = merchants?.find(
							(m: Merchant) => m.merchant_type === 'RIDES'
						)
						set({
							selectedMerchantId: merchantId.toString(),
							selectedMerchantCoordinates: merchants?.find(
								(m: Merchant) => m.id === +merchantId
							)?.coordinates
						})

						if (rideMerchant) {
							set({ carmelMerchantId: rideMerchant.id })
							set({ carmelMealPeriodId: rideMerchant.meal_period_ids[0] })
						}
					}
				} catch (error) {
					console.error('Error initializing store:', error)
				} finally {
					set({ showLoadingScreen: false })
				}
			}
		}
	})
)
