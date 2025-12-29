import React from "react"
import { Image } from "@mantine/core"
import { StyledButton, StyledDivider } from "@/design-components"
import CartItem from "../cart-item"
import {
	areSimilarCoordinates,
	showPrice,
	getMealPeriodWorkingHours,
	isWithinMealPeriod,
	customNotification
} from "@/shared-utils"
import { flatten, map, toNumber } from "lodash"
import calculateTotalPrice from "../../utils/calculateTotalPrice"
import { cartActionTypes } from "../../reducers/cartReducerts"
import { ScheduledDate } from "../../order-page.style"
import { ICON_SIZE } from "@/shared-constants"
import { IconCalendar } from "@tabler/icons-react"
import useMenu from "@/hooks/menu/useMenu"
import {
	CartContainer,
	EmptyCartContainer,
	EmptyCartLabel,
	CartSubtotalPrice,
	CartTaxAmount,
	CartTotalPrice,
	CartPriceContainer,
	DiscountAmount,
	CartDeliveryFee,
	CheckoutDisabled,
	CartTip
} from "./cart.style"
import { useMediaQuery } from "@mantine/hooks"
import validateCartItems from "@/components/shared/utils/validateCartItems"
interface MealPeriod {
	mealPeriodId: number
	startHour: string
	endHour: string
}

const Cart = ({
	cartState,
	dispatchCart,
	mealPeriodStartHour,
	mealPeriodEndHour,
	setScheduleOrderModalOpen,
	setCartHasAlcohol
}: any) => {
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")

	const { data: menuData } = useMenu({
		hotelId: cartState?.currentHotel?.id
	})
	const validateCartItemAvailability = async () => {
		if (!menuData) {
			return false
		}

		const mealPeriodIds =
			cartState?.order?.items?.map(
				(item: { mealPeriodId: number }) => item.mealPeriodId
			) || []

		const mealPeriodData = mealPeriodIds
			.map((mealPeriodId: any) => {
				const menuItem = menuData.find(
					(menuItem: any) => menuItem.mealPeriodId === mealPeriodId
				)
				return menuItem
					? {
							startHour: menuItem.mealPeriodStartHour,
							endHour: menuItem.mealPeriodEndHour,
							mealPeriodId
					  }
					: null
			})
			.filter((item: any): item is MealPeriod => item !== null)

		return validateCartItems(
			mealPeriodData,
			new Date(),
			cartState?.currentHotel?.timezone
		)
	}

	const voucher = cartState?.order?.voucher
	const hasDeliveryFee = areSimilarCoordinates(
		cartState?.currentHotel?.coordinates,
		cartState?.selectedMerchantCoordinates
	)
		? false
		: cartState?.currentHotel?.hasDeliveryFee

	const {
		totalPrice,
		undiscountedSubTotalPrice,
		taxAmount,
		totalDifference,
		calculatedTip,
		serviceFee,
		subTotalDifference
	} = calculateTotalPrice({
		voucher,
		tip: cartState?.order?.tip,
		taxRate: cartState?.taxRate,
		items: cartState?.order?.items,
		isTaxExempt: cartState?.currentHotel?.isTaxExempt,
		deliveryFee:
			cartState?.shipdayDeliveryFee > 0
				? cartState?.shipdayDeliveryFee
				: cartState?.currentHotel?.deliveryFee,
		hasDeliveryFee: hasDeliveryFee,
		isMandatoryTipEnabled: cartState?.currentHotel?.enableAutomaticTip,
		isDeliveryInSamePlace: areSimilarCoordinates(
			cartState?.currentHotel?.coordinates,
			cartState?.selectedMerchantCoordinates
		)
	})
	let checkoutDisabled = !!mealPeriodStartHour && !!mealPeriodEndHour
	if (mealPeriodStartHour && mealPeriodEndHour) {
		const { mealPeriodStartTime, mealPeriodEndTime, isLateNightMeal } =
			getMealPeriodWorkingHours({
				timezone: cartState?.currentHotel?.timezone,
				startHour: mealPeriodStartHour,
				endHour: mealPeriodEndHour
			})

		const isWithinWorkingHours = isWithinMealPeriod(
			mealPeriodStartTime,
			mealPeriodEndTime,
			isLateNightMeal
		)

		checkoutDisabled = !isWithinWorkingHours && !cartState?.order?.scheduledDate
	}

	const handleCheckout = async () => {
		dispatchCart({ type: cartActionTypes.SET_SHOW_CART_MODAL, payload: false })

		if (!cartState.order?.scheduledDate) {
			const isValid = await validateCartItemAvailability()
			if (!isValid) {
				customNotification.error({
					title: "Validation Error",
					message:
						"Some items in your cart are not available at the current time. Please adjust your order or schedule it for a different time."
				})
				return
			}
		}
		const hasAlcoholItem = cartState?.order?.items
			.flatMap((item: any) => item.tags)
			.some((tag: string) => tag.toLowerCase().includes("alcohol"))
		setCartHasAlcohol(hasAlcoholItem)

		if (!hasAlcoholItem) {
			dispatchCart({
				type: cartActionTypes.SET_SHOW_CHECKOUT_PAGE,
				showCheckoutPage: true
			})
			dispatchCart({
				type: cartActionTypes.SET_CART_HAS_ALCOHOL,
				hasAlcohol: false
			})
			if (cartState?.currentHotel?.enableAutomaticTip) {
				dispatchCart({
					type: cartActionTypes.SET_CALCULATED_ADDITIONAL_TIP,
					calculatedAddionalTip: parseFloat(calculatedTip)
				})
			}
			dispatchCart({
				type: cartActionTypes.SET_ORDER_TIP,
				tip: 0
			})
			window.scrollTo({ top: 0, behavior: "smooth" })
		}
	}

	return (
		<CartContainer isSmallScreen={isSmallScreen}>
			{!isSmallScreen ? <StyledDivider label='Cart' font='md700' /> : null}
			{cartState.order?.scheduledDate && (
				<ScheduledDate>
					Order scheduled for:
					<div>{`${cartState.order?.scheduledDate}`}</div>
				</ScheduledDate>
			)}
			{checkoutDisabled && (
				<CheckoutDisabled>
					<>Outside working hours, please schedule the order</>
					<StyledButton
						disabled={cartState.order?.scheduledDate}
						icon={<IconCalendar size={ICON_SIZE} />}
						onClick={() => setScheduleOrderModalOpen(true)}
					>
						Schedule order
					</StyledButton>
				</CheckoutDisabled>
			)}
			{cartState?.order?.items.length > 0 ? (
				<>
					{cartState?.order?.items.map((cartItem: any) => (
						<React.Fragment key={cartItem?.id}>
							<CartItem
								dispatchCart={dispatchCart}
								productName={cartItem?.name}
								productImage={cartItem?.imageUrl}
								productMealPeriodId={cartItem?.mealPeriodId}
								cartItemId={cartItem?.cartItemId}
								productQuantity={cartItem?.quantity}
								productPrice={cartItem?.price}
								productModifierOptions={flatten(
									map(cartItem?.modifiers, "options")
								)}
							/>
							<StyledDivider />
						</React.Fragment>
					))}
					<CartPriceContainer>
						<CartSubtotalPrice>
							<div>Subtotal</div>
							<div>{showPrice(undiscountedSubTotalPrice)}</div>
						</CartSubtotalPrice>
						{toNumber(subTotalDifference) > 0 ? (
							<DiscountAmount>
								<div>Discount</div>
								<div>- {showPrice(subTotalDifference)}</div>
							</DiscountAmount>
						) : null}
						{toNumber(serviceFee) > 0 ? (
							<CartDeliveryFee>
								<div>Service Fee</div>
								<div>{showPrice(serviceFee)}</div>
							</CartDeliveryFee>
						) : null}
						{!cartState.currentHotel?.isTaxExempt && (
							<CartTaxAmount>
								<div>
									Tax {`(${parseFloat(cartState?.taxRate || 0)?.toFixed(3)}%)`}
								</div>
								<div>{showPrice(taxAmount)}</div>
							</CartTaxAmount>
						)}
						{cartState?.order?.tip ? (
							<CartTip>
								<div>Tip</div>
								<div>{showPrice(cartState?.order?.tip)}</div>
							</CartTip>
						) : null}
						{toNumber(totalDifference) > 0 && (
							<DiscountAmount>
								<div>Discount</div>
								<div>- {showPrice(totalDifference)}</div>
							</DiscountAmount>
						)}
						<CartTotalPrice>
							<div>Total</div>
							<div>{showPrice(totalPrice)}</div>
						</CartTotalPrice>
						<StyledDivider />
					</CartPriceContainer>
					<StyledButton
						size='md'
						mb={96}
						fullWidth={true}
						disabled={checkoutDisabled}
						onClick={handleCheckout}
					>
						Checkout
					</StyledButton>
				</>
			) : (
				<EmptyCartContainer>
					<Image src='/empty-cart.svg' alt='Empty cart' width={250} />
					<EmptyCartLabel>
						<div>Your cart is empty</div>
						<div>Add items to get started</div>
					</EmptyCartLabel>
				</EmptyCartContainer>
			)}
		</CartContainer>
	)
}

export default Cart
