import { cloneDeep, filter, find, isEqual, omit, orderBy } from "lodash"

export const initialState = {
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
	taxRate: 0,
	voucherCode: "",
	mealPeriodId: null,
	currentHotel: null,
	temporaryItem: {},
	showCheckoutPage: false,
	showPaymentPage: false,
	paymentButtonEnabled: false,
	showMerchantSelectionPage: false,
	calculatedAddionalTip: 0,
	selectedMerchantCoordinates: {},
	showCartModal: false
}

export const cartActionTypes = {
	SET_CURRENT_HOTEL: "SET_CURRENT_HOTEL",
	SET_CURRENT_MEAL_PERIOD_ID: "SET_CURRENT_MEAL_PERIOD_ID",
	SET_ORDER_ID: "SET_ORDER_ID",
	SET_ORDER_CLIENT_NAME: "SET_ORDER_CLIENT_NAME",
	SET_ORDER_CLIENT_NUMBER: "SET_ORDER_CLIENT_NUMBER",
	SET_ORDER_CLIENT_EMAIL: "SET_ORDER_CLIENT_EMAIL",
	SET_ORDER_ROOM_NUMBER: "SET_ORDER_ROOM_NUMBER",
	SET_ORDER_TYPE: "SET_ORDER_TYPE",
	SET_ORDER_TIP: "SET_ORDER_TIP",
	SET_ORDER_APPROVE: "SET_ORDER_APPROVE",
	SET_VOUCHER: "SET_VOUCHER",
	ADD_ORDER_ITEM: "ADD_ORDER_ITEM",
	REMOVE_ORDER_ITEM: "REMOVE_ORDER_ITEM",
	CHANGE_ORDER_ITEM_QUANTITY: "CHANGE_ORDER_ITEM_QUANTITY",
	ADD_TEMPORARY_ITEM: "ADD_TEMPORARY_ITEM",
	CHANGE_TEMPORARY_ITEM_QUANTITY: "CHANGE_TEMPORARY_ITEM_QUANTITY",
	ADD_TEMPORARY_ITEM_MODIFIER_OPTION: "ADD_TEMPORARY_ITEM_MODIFIER_OPTION",
	RESET_TEMPORARY_ITEM: "RESET_TEMPORARY_ITEM",
	SET_SHOW_CHECKOUT_PAGE: "SET_SHOW_CHECKOUT_PAGE",
	SET_SHOW_PAYMENT_PAGE: "SET_SHOW_PAYMENT_PAGE",
	RESET_ORDER: "RESET_ORDER",
	SET_SCHEDULED_ORDER_DATE: "SET_SCHEDULED_ORDER_DATE",
	SET_TAX_RATE: "SET_TAX_RATE",
	SET_VOUCHER_CODE: "SET_VOUCHER_CODE",
	SET_ORDER_COMMENT: "SET_ORDER_COMMENT",
	SET_NUMBER_OF_CUTLERIES: "SET_NUMBER_OF_CUTLERIES",
	RESERVATION_DISCOUNT: "RESERVATION_DISCOUNT",
	SET_CART_HAS_ALCOHOL: "SET_CART_HAS_ALCOHOL",
	SET_SHOW_MERCHANT_SELECTION_PAGE: "SET_SHOW_MERCHANT_SELECTION_PAGE",
	SET_CALCULATED_ADDITIONAL_TIP: "SET_CALCULATED_ADDITIONAL_TIP",
	SET_SELECTED_MERCHANT_COORDINATES: "SET_SELECTED_MERCHANT_COORDINATES",
	SET_SHOW_CART_MODAL: "SET_SHOW_CART_MODAL"
}

const cartReducer = (state: any, action: any) => {
	switch (action.type) {
		case cartActionTypes.SET_ORDER_ID:
			return {
				...state,
				order: { ...state.order, id: action.id, orderId: action.orderId }
			}
		case cartActionTypes.SET_ORDER_CLIENT_NAME:
			return {
				...state,
				order: { ...state.order, clientName: action.clientName }
			}
		case cartActionTypes.SET_ORDER_CLIENT_NUMBER:
			return {
				...state,
				order: { ...state.order, clientNumber: action.clientNumber }
			}
		case cartActionTypes.SET_ORDER_CLIENT_EMAIL:
			return {
				...state,
				order: { ...state.order, clientEmail: action.clientEmail }
			}
		case cartActionTypes.SET_ORDER_ROOM_NUMBER:
			return {
				...state,
				order: { ...state.order, roomNumber: action.roomNumber }
			}
		case cartActionTypes.SET_ORDER_TYPE:
			return {
				...state,
				order: { ...state.order, orderType: action.orderType }
			}
		case cartActionTypes.SET_ORDER_COMMENT:
			return { ...state, order: { ...state.order, comment: action.comment } }
		case cartActionTypes.SET_ORDER_APPROVE:
			return { ...state, order: { ...state.order, approve: action.approve } }
		case cartActionTypes.SET_ORDER_TIP:
			return { ...state, order: { ...state.order, tip: action.tip } }
		case cartActionTypes.SET_SCHEDULED_ORDER_DATE:
			return {
				...state,
				order: { ...state.order, scheduledDate: action.scheduledDate }
			}
		case cartActionTypes.SET_NUMBER_OF_CUTLERIES:
			return {
				...state,
				order: { ...state.order, numberOfCutleries: action.numberOfCutleries }
			}
		case cartActionTypes.SET_TAX_RATE:
			return { ...state, taxRate: action.taxRate }
		case cartActionTypes.SET_VOUCHER_CODE:
			return { ...state, voucherCode: action.voucherCode }
		case cartActionTypes.ADD_ORDER_ITEM: {
			const clonedItem = cloneDeep(action.item)

			const fieldsToOmit = ["quantity", "cartItemId", "cartItemTime"]

			const stripepdClonedItem = omit(clonedItem, fieldsToOmit)

			const existingItem = find(state.order.items, item => {
				const strippedItem = omit(item, fieldsToOmit)
				return isEqual(stripepdClonedItem, strippedItem)
			})

			if (existingItem) {
				const filteredItems = filter(
					state.order.items,
					item => item.cartItemId !== existingItem?.cartItemId
				)

				return {
					...state,
					order: {
						...state.order,
						items: [
							...filteredItems,
							{ ...existingItem, quantity: existingItem.quantity + 1 }
						]
					}
				}
			}
			return {
				...state,
				order: { ...state.order, items: [...state.order.items, action.item] }
			}
		}
		case cartActionTypes.REMOVE_ORDER_ITEM:
			return {
				...state,
				order: {
					...state.order,
					items: filter(
						state.order.items,
						item => item.cartItemId !== action.cartItemId
					)
				}
			}
		case cartActionTypes.CHANGE_ORDER_ITEM_QUANTITY: {
			const currentItem = find(state.order.items, {
				cartItemId: action.item.cartItemId
			})

			if (currentItem) {
				const otherItems = filter(
					state.order.items,
					item => item.cartItemId !== action.item.cartItemId
				)
				return {
					...state,
					order: {
						...state.order,
						items: orderBy(
							[
								...otherItems,
								{ ...currentItem, quantity: action.item.quantity }
							],
							"cartItemTime"
						)
					}
				}
			} else {
				return state
			}
		}
		case cartActionTypes.SET_VOUCHER:
			return { ...state, order: { ...state.order, voucher: action.voucher } }
		case cartActionTypes.SET_CURRENT_MEAL_PERIOD_ID:
			return { ...state, mealPeriodId: action.mealPeriodId }
		case cartActionTypes.SET_CURRENT_HOTEL:
			return {
				...initialState,
				currentHotel: action.currentHotel,
				order: {
					...initialState?.order,
					roomNumber: state?.order?.roomNumber,
					clientName: state?.order?.clientName,
					clientNumber: state?.order?.clientNumber,
					clientEmail: state?.order?.clientEmail
				}
			}
		case cartActionTypes.ADD_TEMPORARY_ITEM:
			return { ...state, temporaryItem: action.temporaryItem }
		case cartActionTypes.SET_SHOW_CHECKOUT_PAGE:
			return { ...state, showCheckoutPage: action.showCheckoutPage }
		case cartActionTypes.SET_SHOW_PAYMENT_PAGE:
			return { ...state, showPaymentPage: action.showPaymentPage }
		case cartActionTypes.ADD_TEMPORARY_ITEM_MODIFIER_OPTION: {
			const filteredModifiers = filter(
				state.temporaryItem.modifiers,
				modifier => {
					return modifier?.id !== action.temporaryItemModifier.id
				}
			)
			return {
				...state,
				temporaryItem: {
					...state.temporaryItem,
					modifiers: [...filteredModifiers, action.temporaryItemModifier]
				}
			}
		}
		case cartActionTypes.RESET_TEMPORARY_ITEM: {
			return {
				...state,
				temporaryItem: {}
			}
		}
		case cartActionTypes.CHANGE_TEMPORARY_ITEM_QUANTITY: {
			return {
				...state,
				temporaryItem: {
					...state.temporaryItem,
					quantity: action.quantity
				}
			}
		}
		case cartActionTypes.RESERVATION_DISCOUNT: {
			return {
				...state,
				order: {
					...state.order,
					clientName: action.clientName,
					clientEmail: action.clientEmail,
					clientNumber: action.clientNumber,
					roomNumber: action.roomNumber,
					voucherCode: action.voucherCode
				}
			}
		}
		case cartActionTypes.SET_CART_HAS_ALCOHOL:
			return {
				...state,
				order: { ...state.order, hasAlcohol: action.hasAlcohol }
			}
		case cartActionTypes.SET_SHOW_MERCHANT_SELECTION_PAGE:
			return {
				...state,
				showMerchantSelectionPage: action.showMerchantSelectionPage
			}
		case cartActionTypes.SET_CALCULATED_ADDITIONAL_TIP:
			return { ...state, calculatedAddionalTip: action.calculatedAddionalTip }
		case cartActionTypes.SET_SELECTED_MERCHANT_COORDINATES:
			return {
				...state,
				selectedMerchantCoordinates: action.selectedMerchantCoordinates
			}
		case cartActionTypes.SET_SHOW_CART_MODAL:
			return { ...state, showCartModal: action.showCartModal }
		case cartActionTypes.RESET_ORDER:
			return { ...state, order: initialState.order }
		default:
			return state
	}
}

export default cartReducer
