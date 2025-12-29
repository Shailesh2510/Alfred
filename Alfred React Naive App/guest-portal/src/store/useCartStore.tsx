/* eslint-disable unicorn/consistent-function-scoping */
import { create } from 'zustand'
import { MenuItem } from '../types/menu-types/menu'
import { orderBy } from '../lib/utils'
import { Voucher } from '../types/others'
// import { FoodCheckoutFormValues } from '../types/order-types'

interface CartState {
	order: {
		id: string
		tip: number
		items: any[]
		orderType: string | null
		scheduledDate: string | Date
		voucher: Voucher | null
		comment: string
		numberOfCutleries: number
		approve: boolean
		hasAlcohol: boolean
		orderId: number
		nonce: string
	}
	taxRate: string
	voucherCode: string
	mealPeriodId: number
	temporaryItem: any
	calculatedAdditionalTip: number
	showCartModal: boolean
	deliveryFee: number
	showScheduleModal: boolean
	showCartModalOnScheduleModalClose: boolean
	openPaymentFailedModal: boolean
	menuItems: any
	selectedMenuItem: MenuItem | null
	tipByUser: number
	clientFirstName: string
	clientLastName: string
	clientNumber: string
	clientEmail: string
	roomNumber: string
	isSearchActive: boolean
	searchText: string
	selectedFilters: string[]
}

interface CartActions {
	setCurrentMealPeriodId: (mealPeriodId: number) => void
	setOrderClientFirstName: (clientFirstName: string) => void
	setOrderClientLastName: (clientLastName: string) => void
	setOrderClientNumber: (clientNumber: string) => void
	setOrderClientEmail: (clientEmail: string) => void
	setOrderRoomNumber: (roomNumber: string) => void
	setOrderType: (orderType: string | null) => void
	setOrderComment: (comment: string) => void
	setOrderTip: (tip: number) => void
	setOrderScheduledDate: (scheduledDate: string | Date) => void
	addOrderItem: (item: any) => void
	setOrderItems: (items: any) => void
	removeOrderItem: (cartItemId: string) => void
	changeOrderItemQuantity: (cartItemId: string, quantity: number) => void
	setMenuItems: (menuItems: any) => void
	setSelectedMenuItem: (selectedMenuItem: MenuItem | null) => void
	addTemporaryItem: (temporaryItem: any) => void
	addTemporaryItemModifierOption: (temporaryItemModifier: any) => void
	resetTemporaryItem: () => void
	changeTemporaryItemQuantity: (quantity: number) => void
	setDeliveyFee: (deliveryFee: number) => void
	resetOrder: () => void
	setVoucher: (voucherDetails: Voucher | null) => void
	setVoucherCode: (voucherCode: string) => void
	setOrderCutleries: (numberOfCutleries: number) => void
	resetOrderItems: () => void
	setTipByUser: (tipByUser: number) => void
	setOrderId: (orderId: number, nonce: string) => void
	setIsSearchActive: (isSearchActive: boolean) => void
	setSearchText: (searchText: string) => void
	setHasAlcohol: (hasAlcohol: boolean) => void
	setSelectedFilters: (selectedFilters: string[]) => void
}

const initialState: CartState = {
	order: {
		id: '',
		tip: 0,
		items: [],
		orderType: null,
		scheduledDate: 'ASAP',
		voucher: null,
		comment: '',
		numberOfCutleries: 1,
		approve: false,
		hasAlcohol: false,
		orderId: 0,
		nonce: ''
	},
	taxRate: '',
	voucherCode: '',
	mealPeriodId: 0,
	clientFirstName: '',
	clientLastName: '',
	clientNumber: '',
	clientEmail: '',
	roomNumber: '',
	temporaryItem: {},
	calculatedAdditionalTip: 0,
	showCartModal: false,
	deliveryFee: 0,
	showScheduleModal: false,
	showCartModalOnScheduleModalClose: false,
	openPaymentFailedModal: false,
	menuItems: null,
	selectedMenuItem: null,
	tipByUser: 0,
	isSearchActive: false,
	searchText: '',
	selectedFilters: []
}

export const useCartStore = create<CartState & CartActions>((set, get) => ({
	...initialState,

	setCurrentMealPeriodId: mealPeriodId => set({ mealPeriodId }),

	setOrderId: (orderId, nonce) => {
		const order = get().order
		set({ order: { ...order, orderId, nonce } })
	},

	setIsSearchActive: isSearchActive => set({ isSearchActive }),
	setSearchText: searchText => set({ searchText }),

	setOrderClientFirstName: clientFirstName => {
		set({ clientFirstName })
	},
	setOrderClientLastName: clientLastName => {
		set({ clientLastName })
	},
	setOrderClientNumber: clientNumber => {
		set({ clientNumber })
	},

	setOrderClientEmail: clientEmail => {
		set({ clientEmail })
	},

	setSelectedFilters: selectedFilters => set({ selectedFilters }),

	setOrderItems: (items: any) => {
		const order = get().order
		set({ order: { ...order, items } })
	},

	setOrderRoomNumber: roomNumber => {
		set({ roomNumber })
	},
	setDeliveyFee: deliveryFee => set({ deliveryFee }),

	setOrderType: orderType => {
		const order = get().order
		set({ order: { ...order, orderType } })
	},

	setOrderComment: comment => {
		const order = get().order
		set({ order: { ...order, comment } })
	},

	setOrderTip: tip => {
		const order = get().order
		set({ order: { ...order, tip } })
	},

	setOrderScheduledDate: scheduledDate => {
		const order = get().order
		set({ order: { ...order, scheduledDate } })
	},

	addOrderItem: item => {
		const order = get().order
		const clonedItem = { ...item }
		const fieldsToOmit = ['quantity', 'cartItemId', 'cartItemTime']

		const omitFields = (object: any, fields: string[]) => {
			const result = { ...object }
			for (const field of fields) {
				delete result[field]
			}
			return result
		}

		const strippedItem = omitFields(clonedItem, fieldsToOmit)

		const existingItem = order.items.find(
			index =>
				JSON.stringify(omitFields(index, fieldsToOmit)) ===
				JSON.stringify(strippedItem)
		)

		if (existingItem) {
			const updatedItems = order.items.map(index =>
				index.cartItemId === existingItem.cartItemId
					? { ...existingItem, quantity: existingItem.quantity + 1 }
					: index
			)
			set({ order: { ...order, items: updatedItems } })
		} else {
			set({ order: { ...order, items: [...order.items, item] } })
		}
	},

	removeOrderItem: cartItemId => {
		const order = get().order
		set({
			order: {
				...order,
				items: order.items.filter(
					(item: { cartItemId: string }) => item.cartItemId !== cartItemId
				)
			}
		})
	},

	changeOrderItemQuantity: (cartItemId, quantity) => {
		const order = get().order
		const updatedItems = order.items.map(item =>
			item.cartItemId === cartItemId ? { ...item, quantity } : item
		)
		set({
			order: {
				...order,
				items: orderBy(updatedItems, [item => item.cartItemTime], ['asc'])
			}
		})
	},

	setHasAlcohol: (hasAlcohol: boolean) =>
		set(state => ({ order: { ...state.order, hasAlcohol } })),

	setMenuItems: menuItems => set({ menuItems }),

	setSelectedMenuItem: selectedMenuItem => set({ selectedMenuItem }),

	addTemporaryItem: temporaryItem => set({ temporaryItem }),

	addTemporaryItemModifierOption: temporaryItemModifier => {
		const temporaryItem = get().temporaryItem
		set({
			temporaryItem: {
				...temporaryItem,
				modifiers: [
					...temporaryItem.modifiers.filter(
						(modifier: any) => modifier?.id !== temporaryItemModifier.id
					),
					temporaryItemModifier
				]
			}
		})
	},

	resetTemporaryItem: () => set({ temporaryItem: {} }),

	changeTemporaryItemQuantity: quantity => {
		const temporaryItem = get().temporaryItem
		set({ temporaryItem: { ...temporaryItem, quantity } })
	},

	resetOrder: () => set({ order: initialState.order }),

	setVoucher: voucherDetails => {
		const order = get().order
		set({ order: { ...order, voucher: voucherDetails } })
	},

	setVoucherCode: (voucherCode: string) => set({ voucherCode }),

	setOrderCutleries: (numberOfCutleries: number) => {
		const order = get().order
		set({ order: { ...order, numberOfCutleries } })
	},

	setTipByUser: (tipByUser: number) => set({ tipByUser }),

	resetOrderItems: () => {
		const order = get().order
		const currentDeliveryFee = get().deliveryFee

		set({
			order: {
				...initialState.order,
				scheduledDate: order.scheduledDate
			},
			deliveryFee: currentDeliveryFee
		})
	}
}))
