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
import { useRouter } from "next/router"
import validateCartItems from "@/components/shared/utils/validateCartItems"
import useGlobalStore from "@/globalStore/globalStore"
import useCartStore from "../../stores/useCartStore"
import { calculateDeliveryFee } from "../../utils/calculateDeliveryFee"
interface MealPeriod {
	mealPeriodId: number
	startHour: string
	endHour: string
}

const NewCart = ({
	mealPeriodStartHour,
	mealPeriodEndHour,
	setScheduleOrderModalOpen,
	setShowAlcoholConsentModal
}: any) => {
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")
	const router = useRouter()
	const { merchantId } = router.query
	const searchParams = new URLSearchParams(router.asPath.split("?")[1])
	let backUrl = `/roomService/${merchantId}/checkout`
	const { currentHotelDetails } = useGlobalStore()
	const {
		order,
		selectedMerchantCoordinates,
		taxRate,
		shipdayDeliveryFee,
		setShowCartModal,
		setCartHasAlcohol,
		setCalculatedAdditionalTip,
		setOrderTip,
		setShowCartModalOnScheduleModalClose,
		merchantDetails
	} = useCartStore()
	const { data: menuData } = useMenu({
		hotelId: currentHotelDetails?._id
	})

	const validateCartItemAvailability = async () => {
		if (!menuData) {
			return false
		}

		const mealPeriodIds =
			order?.items?.map(
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
			currentHotelDetails?.timezone
		)
	}

	const voucher = order?.voucher
	const hasDeliveryFee = areSimilarCoordinates(
		currentHotelDetails?.coordinates,
		selectedMerchantCoordinates
	)
		? false
		: currentHotelDetails?.hasDeliveryFee

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
		tip: order?.tip,
		taxRate: taxRate,
		items: order?.items,
		isTaxExempt: currentHotelDetails?.isTaxExempt,
		deliveryFee: calculateDeliveryFee(
			hasDeliveryFee,
			merchantDetails?.has_third_party_delivery,
			shipdayDeliveryFee,
			currentHotelDetails?.deliveryFee
		),
		hasDeliveryFee: hasDeliveryFee,
		isMandatoryTipEnabled: currentHotelDetails?.enableAutomaticTip,
		isDeliveryInSamePlace: areSimilarCoordinates(
			currentHotelDetails?.coordinates,
			selectedMerchantCoordinates
		)
	})
	let checkoutDisabled = !!mealPeriodStartHour && !!mealPeriodEndHour
	if (mealPeriodStartHour && mealPeriodEndHour) {
		const { mealPeriodStartTime, mealPeriodEndTime, isLateNightMeal } =
			getMealPeriodWorkingHours({
				timezone: currentHotelDetails?.timezone,
				startHour: mealPeriodStartHour,
				endHour: mealPeriodEndHour
			})

		const isWithinWorkingHours = isWithinMealPeriod(
			mealPeriodStartTime,
			mealPeriodEndTime,
			isLateNightMeal
		)

		checkoutDisabled = !isWithinWorkingHours && !order?.scheduledDate
	}

	const handleCheckout = async () => {
		setShowCartModal(false)
		if (!order?.scheduledDate) {
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
		const hasAlcoholItem = order?.items
			.flatMap((item: any) => item.tags)
			.some((tag: string) => tag.toLowerCase().includes("alcohol"))
		setShowAlcoholConsentModal(hasAlcoholItem)

		if (!hasAlcoholItem) {
			setCartHasAlcohol(false)
			setShowAlcoholConsentModal(false)
			if (currentHotelDetails?.enableAutomaticTip) {
				setCalculatedAdditionalTip(parseFloat(calculatedTip))
			}
			setOrderTip(0)
			if (searchParams.toString()) {
				backUrl += `?${searchParams.toString()}`
			}
			router.push(backUrl)

			window.scrollTo({ top: 0, behavior: "smooth" })
		}
	}

	return (
		<CartContainer isSmallScreen={isSmallScreen}>
			{!isSmallScreen ? <StyledDivider label='Cart' font='md700' /> : null}
			{order?.scheduledDate && (
				<ScheduledDate>
					Order scheduled for:
					<div>{`${order?.scheduledDate}`}</div>
				</ScheduledDate>
			)}
			{checkoutDisabled && (
				<CheckoutDisabled>
					<>Outside working hours, please schedule the order</>
					<StyledButton
						disabled={order?.scheduledDate}
						icon={<IconCalendar size={ICON_SIZE} />}
						onClick={() => {
							setShowCartModalOnScheduleModalClose(true)
							setScheduleOrderModalOpen(true)
						}}
					>
						Schedule order
					</StyledButton>
				</CheckoutDisabled>
			)}
			{order?.items.length > 0 ? (
				<>
					{order?.items.map((cartItem: any) => (
						<React.Fragment key={cartItem?.id}>
							<CartItem
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
						{!currentHotelDetails?.isTaxExempt && (
							<CartTaxAmount>
								<div>Tax {`(${parseFloat(taxRate || "0")?.toFixed(3)}%)`}</div>
								<div>{showPrice(taxAmount)}</div>
							</CartTaxAmount>
						)}
						{order?.tip ? (
							<CartTip>
								<div>Tip</div>
								<div>{showPrice(order?.tip)}</div>
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

export default NewCart
