import { useMediaQuery } from "@mantine/hooks"
import { useRouter } from "next/router"
import { Image } from "@mantine/core"
import React from "react"
import styled from "@emotion/styled"
import { StyledButton, StyledDivider } from "@/design-components"
import { toNumber } from "lodash"
import {
	customNotification,
	showPrice,
	validateScheduleRideTime
} from "@/shared-utils"
import useRideStore from "../../store/useRideStore"
import CartItem from "./CartItem"
import calculateRideTotalPrice from "../../utils/utils"

const RideCartContainer = styled.div<{ isSmallScreen: boolean }>`
	top: 80px;
	margin-top: ${({ isSmallScreen }) => (isSmallScreen ? "0px" : "48px")};
	position: sticky;
`

const EmptyRideCartContainer = styled.div`
	margin: 48px 0;
	display: flex;
	border-radius: 8px;
	align-items: center;
	flex-direction: column;
	justify-content: center;
`

const EmptyRideCartLabel = styled.div`
	margin: 48px 0;
	text-align: center;
	color: ${({ theme }) => theme.colors.dark[3]};
	${({ theme }) => theme.other.typography.xl300};
`

const RideCartPriceContainer = styled.div`
	padding: 24px 0;
	display: flex;
	flex-direction: column;
`

const RideDiscountAmount = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.md700};
	color: ${({ theme }) => theme.colors.green[5]};
`

const RideCartTotalPrice = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.headings.h3};
	color: ${({ theme }) => theme.colors.black};
`

const RideCartSubtotalPrice = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	justify-content: space-between;
	${({ theme }) => theme.other.typography.sm700};
	color: ${({ theme }) => theme.colors.black};
`

const ScheduledDate = styled.div`
	color: white;
	display: flex;
	margin-top: 8px;
	padding: 8px 16px;
	border-radius: 4px;
	flex-direction: column;
	justify-content: center;
	${({ theme }) => theme.other.typography.md600};
	background-color: ${({ theme }) => theme.colors.green[4]};
`

const RideCart = () => {
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")
	const router = useRouter()
	const { hotelId, merchantId } = router.query
	const searchParams = new URLSearchParams(router.asPath.split("?")[1])
	let checkoutUrl = `/${hotelId}/rides/${merchantId}/checkout`

	const {
		ride,
		setShowCartModal,
		rideOptions,
		setOpenChangeRideForm,
		currentHotelDetails
	} = useRideStore()

	const voucher = ride?.voucher
	const { totalPrice, totalDifference, subTotalPrice } =
		calculateRideTotalPrice({
			voucher,
			items: ride?.items
		})
	const checkoutDisabled = ride?.items === null

	const handleCheckout = async () => {
		const rideFareIdExists = rideOptions.filter(
			(rideOption: any) =>
				rideOption.carClassDesc.toLowerCase().trim() ===
				ride?.items?.name.toLowerCase().trim()
		)

		if (rideFareIdExists[0]?.fare?.fareId !== ride?.items?.id) {
			customNotification.error("Please select a valid ride option")
			setShowCartModal(false)
			setOpenChangeRideForm(true)
			return
		}

		if (
			!validateScheduleRideTime(
				ride?.scheduledDate,
				currentHotelDetails?.timezone
			)
		) {
			customNotification.error({
				title: "Unable to book ride",
				message: "Please schedule the ride at least 15 minutes ahead"
			})
			router.push(`/${hotelId}/rides/${merchantId}`)
			setOpenChangeRideForm(true)
			return
		}

		setShowCartModal(false)
		if (searchParams.toString()) {
			checkoutUrl += `?${searchParams.toString()}`
		}
		router.push(checkoutUrl)
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	return (
		<RideCartContainer isSmallScreen={isSmallScreen}>
			{!isSmallScreen ? <StyledDivider label='Cart' font='md700' /> : null}
			{ride?.scheduledDate && (
				<ScheduledDate>
					Ride scheduled for:
					<div>{`${ride?.scheduledDate}`}</div>
				</ScheduledDate>
			)}
			{ride?.items !== null ? (
				<>
					<React.Fragment key={ride?.items?.id}>
						<CartItem
							productName={ride?.items?.name}
							productImage={ride?.items?.imageUrl}
							productPrice={ride?.items?.price}
							rideCartItem={true}
							productModifierOptions={[]}
							productQuantity={0}
						/>
						<StyledDivider />
					</React.Fragment>

					<RideCartPriceContainer>
						<RideCartSubtotalPrice>
							<div>Subtotal</div>
							<div>{showPrice(subTotalPrice)}</div>
						</RideCartSubtotalPrice>

						{toNumber(totalDifference) > 0 && (
							<RideDiscountAmount>
								<div>Discount</div>
								<div>- {showPrice(totalDifference)}</div>
							</RideDiscountAmount>
						)}
						<RideCartTotalPrice>
							<div>Total</div>
							<div>{showPrice(totalPrice)}</div>
						</RideCartTotalPrice>
						<StyledDivider />
					</RideCartPriceContainer>
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
				<EmptyRideCartContainer>
					<Image src='/empty-cart.svg' alt='Empty cart' width={250} />
					<EmptyRideCartLabel>
						<div>Your cart is empty</div>
					</EmptyRideCartLabel>
				</EmptyRideCartContainer>
			)}
		</RideCartContainer>
	)
}

export default RideCart
