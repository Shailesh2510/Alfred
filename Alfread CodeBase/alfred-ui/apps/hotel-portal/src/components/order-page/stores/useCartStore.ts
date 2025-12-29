/* eslint-disable no-unused-vars */
import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { cloneDeep, filter, find, isEqual, omit, orderBy } from "lodash"
interface CartState {
	order: {
		id: string
		tip: number
		items: any[]
		clientName: string
		clientNumber: string
		clientEmail: string
		roomNumber: string
		orderType: string | null
		scheduledDate: string | null
		voucher: any | null
		comment: string
		numberOfCutleries: number
		approve: boolean
		hasAlcohol: boolean
		orderId: number
	}
	taxRate: string
	voucherCode: string
	mealPeriodId: string | null
	currentHotel: any
	temporaryItem: any
	calculatedAdditionalTip: number
	selectedMerchantCoordinates: any
	showCartModal: boolean
	shipdayDeliveryFee: number
	selectedMerchantId: string
	showScheduleModal: boolean
	showCartModalOnScheduleModalClose: boolean
	openPaymentFailedModal: boolean
	merchantDetails: any
}

interface CartActions {
	setCurrentHotelDetails: (currentHotel: any) => void
	setCurrentMealPeriodId: (mealPeriodId: any) => void
	setOrderId: (id: string, orderId: number) => void
	setOrderClientName: (clientName: string) => void
	setOrderClientNumber: (clientNumber: string) => void
	setOrderClientEmail: (clientEmail: string) => void
	setOrderRoomNumber: (roomNumber: string) => void
	setOrderType: (orderType: any) => void
	setOrderComment: (comment: string) => void
	setOrderTip: (tip: number) => void
	setVoucher: (voucher: any) => void
	addOrderItem: (item: any) => void
	removeOrderItem: (cartItemId: string) => void
	changeOrderItemQuantity: (cartItemId: string, quantity: number) => void
	addTemporaryItem: (temporaryItem: any) => void
	addTemporaryItemModifierOption: (temporaryItemModifier: any) => void
	resetTemporaryItem: () => void
	changeTemporaryItemQuantity: (quantity: number) => void
	setScheduledOrderDate: (scheduledDate: any) => void
	setVoucherCode: (voucherCode: string) => void
	setTaxRate: (taxRate: string) => void
	setNumberOfCutleries: (numberOfCutleries: number) => void
	setReservationDiscount: (data: any) => void
	setCartHasAlcohol: (hasAlcohol: boolean) => void
	setCalculatedAdditionalTip: (tip: number) => void
	setSelectedMerchantCoordinates: (coordinates: any) => void
	setShowCartModal: (show: boolean) => void
	setShipdayDeliveryFee: (fee: number) => void
	setSelectedMerchantId: (id: string) => void
	setShowScheduleModal: (show: boolean) => void
	setShowCartModalOnScheduleModalClose: (show: boolean) => void
	setOpenPaymentFailedModal: (openPaymentFailedModal: boolean) => void
	setMerchantDetails: (merchantDetails: any) => void
	resetOrder: () => void
}

const initialState: CartState = {
	order: {
		id: "",
		tip: 0,
		items: [],
		clientName: "",
		clientNumber: "",
		clientEmail: "",
		roomNumber: "",
		orderType: null,
		scheduledDate: null,
		voucher: null,
		comment: "",
		numberOfCutleries: 1,
		approve: false,
		hasAlcohol: false,
		orderId: 0
	},
	taxRate: "",
	voucherCode: "",
	mealPeriodId: null,
	currentHotel: null,
	temporaryItem: {},
	calculatedAdditionalTip: 0,
	selectedMerchantCoordinates: {},
	showCartModal: false,
	shipdayDeliveryFee: 0,
	selectedMerchantId: "",
	showScheduleModal: false,
	showCartModalOnScheduleModalClose: false,
	openPaymentFailedModal: false,
	merchantDetails: null
}

const useCartStore = create<CartState & CartActions>()(
	devtools(
		set =>
			({
				...initialState,

				setCurrentHotelDetails: (hotel: any) => set({ currentHotel: hotel }),
				setCurrentMealPeriodId: (mealPeriodId: any) => set({ mealPeriodId }),
				setOrderId: (id: string, orderId: number) =>
					set(state => ({ order: { ...state.order, id, orderId } })),
				setOrderClientName: (clientName: string) =>
					set(state => ({ order: { ...state.order, clientName } })),
				setOrderClientNumber: (clientNumber: string) =>
					set(state => ({ order: { ...state.order, clientNumber } })),
				setOrderClientEmail: (clientEmail: string) =>
					set(state => ({ order: { ...state.order, clientEmail } })),
				setOrderRoomNumber: (roomNumber: string) =>
					set(state => ({ order: { ...state.order, roomNumber } })),
				setOrderType: (orderType: string | null) =>
					set(state => ({ order: { ...state.order, orderType } })),
				setOrderComment: (comment: string) =>
					set(state => ({ order: { ...state.order, comment } })),
				setOrderTip: (tip: number) =>
					set(state => ({ order: { ...state.order, tip } })),
				setScheduledOrderDate: (scheduledDate: string | null) =>
					set(state => ({ order: { ...state.order, scheduledDate } })),
				setNumberOfCutleries: (numberOfCutleries: number) =>
					set(state => ({ order: { ...state.order, numberOfCutleries } })),
				setTaxRate: (taxRate: string) => set({ taxRate }),
				setVoucherCode: (voucherCode: string) => set({ voucherCode }),

				addOrderItem: (item: any) =>
					set(state => {
						const clonedItem = cloneDeep(item)
						const fieldsToOmit = ["quantity", "cartItemId", "cartItemTime"]
						const strippedItem = omit(clonedItem, fieldsToOmit)

						const existingItem = find(state.order.items, i =>
							isEqual(omit(i, fieldsToOmit), strippedItem)
						)

						if (existingItem) {
							const updatedItems = state.order.items.map(i =>
								i.cartItemId === existingItem.cartItemId
									? { ...existingItem, quantity: existingItem.quantity + 1 }
									: i
							)
							return { order: { ...state.order, items: updatedItems } }
						}
						return {
							order: { ...state.order, items: [...state.order.items, item] }
						}
					}),

				removeOrderItem: (cartItemId: string) =>
					set(state => ({
						order: {
							...state.order,
							items: filter(
								state.order.items,
								item => item.cartItemId !== cartItemId
							)
						}
					})),

				changeOrderItemQuantity: (cartItemId: string, quantity: number) =>
					set(state => {
						const updatedItems = state.order.items.map(item =>
							item.cartItemId === cartItemId ? { ...item, quantity } : item
						)
						return {
							order: {
								...state.order,
								items: orderBy(updatedItems, "cartItemTime")
							}
						}
					}),

				setVoucher: (voucher: string) =>
					set(state => ({ order: { ...state.order, voucher } })),

				addTemporaryItem: (temporaryItem: any) => set({ temporaryItem }),
				addTemporaryItemModifierOption: (temporaryItemModifier: any) =>
					set(state => ({
						temporaryItem: {
							...state.temporaryItem,
							modifiers: [
								...filter(state.temporaryItem.modifiers, modifier => {
									return modifier?.id !== temporaryItemModifier.id
								}),
								temporaryItemModifier
							]
						}
					})),
				resetTemporaryItem: () => set({ temporaryItem: {} }),
				changeTemporaryItemQuantity: (quantity: number) =>
					set(state => ({
						temporaryItem: { ...state.temporaryItem, quantity }
					})),

				setShowCartModal: (showCartModal: boolean) => set({ showCartModal }),
				setShipdayDeliveryFee: (shipdayDeliveryFee: number) =>
					set({ shipdayDeliveryFee }),
				setSelectedMerchantId: (selectedMerchantId: string) =>
					set({ selectedMerchantId }),
				setShowScheduleModal: (showScheduleModal: boolean) =>
					set({ showScheduleModal }),
				setCalculatedAdditionalTip: (tip: number) =>
					set({ calculatedAdditionalTip: tip }),
				setSelectedMerchantCoordinates: (coordinates: any) =>
					set({ selectedMerchantCoordinates: coordinates }),
				setCartHasAlcohol: (hasAlcohol: boolean) =>
					set(state => ({ order: { ...state.order, hasAlcohol } })),
				setReservationDiscount: (data: any) =>
					set(state => ({
						order: { ...state.order, reservationDiscount: data }
					})),
				setShowCartModalOnScheduleModalClose: (show: boolean) =>
					set({ showCartModalOnScheduleModalClose: show }),

				setOpenPaymentFailedModal: (openPaymentFailedModal: boolean) =>
					set({ openPaymentFailedModal }),

				setMerchantDetails: (merchantDetails: any) => set({ merchantDetails }),

				resetOrder: () => set(() => ({ order: initialState.order }))
			} as CartState & CartActions)
	)
)

export default useCartStore
