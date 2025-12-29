import React from "react"
import { ActionIcon, Image } from "@mantine/core"
import { StyledButton, StyledDivider } from "@/design-components"
import CartItem from "../cart-item"
import { longDateFormatWithTimezone, showPrice } from "@/shared-utils"
import { flatten, includes, map, toNumber } from "lodash"
import calculateTotalPrice from "../../utils/calculateTotalPrice"
import { ScheduledDate } from "../../order-page.style"
import { IconCalendar } from "@tabler/icons-react"
import {
	DISCOUNT_VOUCHER_TYPE,
	ICON_SIZE,
	PAYMENT_METHOD
} from "@/shared-constants"
import { IconX } from "@tabler/icons-react"
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
import { formatInTimeZone } from "date-fns-tz"
import { cartActionTypes } from "@/components/order-page/reducers/cartReducerts"
import { useMediaQuery } from "@mantine/hooks"

const Cart = ({
	cartState,
	dispatchCart,
	setCartHasAlcohol,
	setScheduleOrderModalOpen
}: any) => {
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")
	const voucher = cartState?.order?.voucher
	// eslint-disable-next-line no-unused-vars

	const {
		totalPrice,
		undiscountedSubTotalPrice,
		taxAmount,
		totalDifference,
		calculatedTip,
		serviceFee
	} = calculateTotalPrice({
		voucher,
		tip: cartState?.order?.tip,
		taxRate: cartState?.taxRate,
		items: cartState?.order?.items,
		isTaxExempt: cartState?.currentHotel?.isTaxExempt,
		deliveryFee: cartState?.currentHotel?.deliveryFee,
		hasDeliveryFee: 0,
		isMandatoryTipEnabled: false,
		isDeliveryInSamePlace: false
	})

	let formatedScheduledDate = ""

	if (cartState.order?.scheduledDate) {
		formatedScheduledDate = formatInTimeZone(
			cartState.order?.scheduledDate,
			cartState?.currentHotel?.timezone,
			longDateFormatWithTimezone
		)
	}

	const handleCheckout = () => {
		dispatchCart({ type: cartActionTypes.SET_SHOW_CART_MODAL, payload: false })
		const hasAlcoholItem = cartState?.order?.items
			.flatMap((item: any) => item.tags)
			.some((tag: string) => tag.toLowerCase().includes("alcohol"))
		setCartHasAlcohol(hasAlcoholItem)
		dispatchCart({
			type: cartActionTypes.SET_ORDER_TYPE,
			// Temporarily set to ROOM_CHARGE for orders to go through without payment
			//orderType: PAYMENT_METHOD.CREDIT_CARD.value
			orderType: PAYMENT_METHOD.ROOM_CHARGE.value
		})

		if (!hasAlcoholItem) {
			dispatchCart({
				type: cartActionTypes.SET_SHOW_CHECKOUT_PAGE,
				showCheckoutPage: true
			})
			dispatchCart({
				type: cartActionTypes.SET_CART_HAS_ALCOHOL,
				hasAlcohol: false
			})
			if (
				includes(
					cartState?.order?.voucher?.amount_type,
					DISCOUNT_VOUCHER_TYPE.FIXED.value
				) &&
				cartState?.currentHotel?.enableAutomaticTip
			) {
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
			{formatedScheduledDate && (
				<>
					<ScheduledDate>
						<div>
							Order scheduled for:
							<div>{`${formatedScheduledDate}`}</div>
						</div>
						{cartState.order?.scheduledDate ? (
							<ActionIcon
								onClick={() => {
									dispatchCart({
										type: cartActionTypes.SET_SCHEDULED_ORDER_DATE,
										scheduledDate: null
									})
								}}
							>
								<IconX size={ICON_SIZE} color='indianred' />
							</ActionIcon>
						) : null}
					</ScheduledDate>
				</>
			)}
			{!cartState?.order?.scheduledDate && (
				<CheckoutDisabled>
					<div>Please schedule the order</div>
					<StyledButton
						disabled={cartState.order?.scheduledDate}
						icon={<IconCalendar size={ICON_SIZE} />}
						onClick={() => setScheduleOrderModalOpen(true)}
					>
						Schedule order
					</StyledButton>
					{cartState.order?.scheduledDate ? (
						<ActionIcon
							onClick={() => {
								dispatchCart({
									type: cartActionTypes.SET_SCHEDULED_ORDER_DATE,
									scheduledDate: null
								})
							}}
						>
							<IconX size={ICON_SIZE} />
						</ActionIcon>
					) : null}
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
								cartItemId={cartItem?.cartItemId}
								productQuantity={cartItem?.quantity}
								productPrice={cartItem?.price}
								productModifierOptions={flatten(
									map(cartItem?.modifiers, "options")
								)}
								minimumOrderQuantity={cartItem?.minimumOrderQuantity}
							/>
							<StyledDivider />
						</React.Fragment>
					))}
					<CartPriceContainer>
						<CartSubtotalPrice>
							<div>Subtotal</div>
							<div>{showPrice(undiscountedSubTotalPrice)}</div>
						</CartSubtotalPrice>
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
						{voucher && (
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
						disabled={!cartState?.order?.scheduledDate}
						onClick={handleCheckout}
					>
						Checkout
					</StyledButton>
				</>
			) : (
				<EmptyCartContainer>
					<Image src='./../empty-cart.svg' alt='Empty cart' width={250} />
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
