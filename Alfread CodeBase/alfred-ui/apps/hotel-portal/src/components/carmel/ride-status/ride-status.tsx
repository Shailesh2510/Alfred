import { Flex, Grid } from "@mantine/core"
import { IconCircleCheck, IconReservedLine, IconX } from "@tabler/icons-react"
import { useRouter } from "next/router"
import { ORDER_STATUS, PAYMENT_METHOD } from "@/shared-constants"

import React, { useEffect, useState } from "react"
import { showPrice, customNotification } from "@/shared-utils"

import {
	FieldLabel,
	FieldValue,
	RideAmountLabel,
	RideCanceledMessage,
	RideDiscountAmount,
	RideDiscountLabel,
	RideInfoContainer,
	RideInfoLabel,
	RideReservedMessage,
	RideReservedText,
	RideStatusContainer,
	RideSuccessMessage,
	RideConfirmedMessage,
	ServiceFee
} from "./ride-status.style"
import { parseISO } from "date-fns"
import useRideStore from "../store/useRideStore"
import useCreateReferralRecord from "@/hooks/order/useCreateReferralRecord"
import useCurrentHotel from "@/hooks/me/useCurrentHotel"
import useOrder from "@/hooks/order/useOrder"
import { formatInTimeZone } from "date-fns-tz"
import { FlexLoader } from "@/shared-components"

const RideStatus = () => {
	const router = useRouter()
	const {
		orderId,
		orderStatus,
		campaign_uid,
		short_code,
		payment_intent_client_secret
	} = router.query

	const {
		data: order,
		refetch: refetchOrder,
		isLoading: orderLoading
	} = useOrder(
		{ orderId },
		{
			enabled: false,
			refetchOnWindowFocus: false
		}
	)

	const { data: currentHotel } = useCurrentHotel()

	const { setCurrentHotelDetails, currentHotelDetails } = useRideStore()

	const [currentOrder, setCurrentOrder] = useState<any>()

	const { mutate: createReferralRecord } = useCreateReferralRecord({
		onSuccess: () => {
			customNotification.success({
				title: "Success",
				message: "Referral order created successfully."
			})
		},
		onError: () => {
			customNotification.error({
				title: "Failure",
				message: "Something went wrong. Referral failed for this order."
			})
		}
	})

	useEffect(() => {
		setCurrentOrder(order?.data?.[0])
	}, [order])

	useEffect(() => {
		if (orderId) {
			refetchOrder()
		}
	}, [orderId])

	useEffect(() => {
		if (
			orderStatus === "success" &&
			payment_intent_client_secret &&
			campaign_uid &&
			short_code
		) {
			refetchOrder().then(response => {
				const order = response.data.data[0]
				createReferralRecord({
					amount: order?.grandTotal,
					orderId: orderId,
					clientName: order?.clientName,
					clientEmail: order?.clientMail,
					campaignUid: campaign_uid,
					shortCode: short_code
				})
			})
		}
	}, [payment_intent_client_secret])

	useEffect(() => {
		if (!currentHotelDetails) {
			setCurrentHotelDetails(currentHotel?.data?.[0])
		}
	}, [currentHotel])

	if (orderLoading) {
		return <FlexLoader />
	}

	const orderCanceled = currentOrder?.status === ORDER_STATUS.CANCELED.value

	return (
		<RideStatusContainer>
			<Flex align='center' direction='column' mt={50}>
				{orderCanceled && (
					<>
						<IconX size={72} color='#ADB5BD' />
						<RideCanceledMessage>Ride canceled</RideCanceledMessage>
					</>
				)}

				{!orderCanceled && orderStatus === "success" && (
					<>
						{currentOrder?.orderType === PAYMENT_METHOD.PAY_LATER.value &&
						!currentOrder?.isPaid ? (
							<>
								<IconReservedLine size={72} color='#1D72FE' />
								<RideReservedText>Ride Reserved</RideReservedText>
							</>
						) : (
							<>
								<IconCircleCheck size={72} color='#69DB7C' />
								<RideSuccessMessage>Ride Scheduled</RideSuccessMessage>
							</>
						)}
					</>
				)}

				{!currentOrder?.isPaid && !orderCanceled && (
					<Flex align='center' justify='center'>
						<RideReservedMessage>
							{`Attention: Payment is required to complete your booking. A payment link will be sent to you via text and email. Please complete the payment at least 1 hour before your scheduled pick up time, or your booking will be cancelled.`}
						</RideReservedMessage>
					</Flex>
				)}

				{currentOrder?.isPaid && !orderCanceled && (
					<Flex align='center' justify='center'>
						<RideConfirmedMessage>
							{`You'll receive SMS updates as your order progresses.`}
						</RideConfirmedMessage>
					</Flex>
				)}

				{order?.id && (
					<Flex align='center' justify='center'>
						<FieldLabel>Ride ID:&nbsp;</FieldLabel>
						<FieldValue>{order.id}</FieldValue>
					</Flex>
				)}

				{currentOrder?.hotelName && (
					<Flex align='center' justify='center'>
						<FieldLabel>From Hotel:&nbsp;</FieldLabel>
						<FieldValue>{currentOrder.hotelName}</FieldValue>
					</Flex>
				)}

				{currentOrder?.scheduledDate && (
					<Flex align='center' justify='center' mb={24}>
						<FieldLabel>Scheduled for:&nbsp;</FieldLabel>
						<FieldValue>
							{formatInTimeZone(
								parseISO(currentOrder.scheduledDate),
								currentHotelDetails?.timezone,
								"MM/dd h:mm a"
							)}
						</FieldValue>
					</Flex>
				)}
			</Flex>
			<Grid align='center' justify='center'>
				<Grid.Col xs={10} sm={5} md={4} lg={4} xl={4}>
					<>
						<RideInfoContainer>
							<Flex justify='space-between' miw={200}>
								<RideInfoLabel>Payment type:</RideInfoLabel>
								<RideInfoLabel>
									{PAYMENT_METHOD[currentOrder?.orderType]?.label || ""}
								</RideInfoLabel>
							</Flex>
							<Flex justify='space-between' miw={200}>
								<RideInfoLabel>Email:</RideInfoLabel>
								<RideInfoLabel>{currentOrder?.clientEmail || ""}</RideInfoLabel>
							</Flex>
						</RideInfoContainer>
						<RideInfoContainer>
							{currentOrder?.tip > 0 && (
								<Flex justify='space-between' miw={200}>
									<RideDiscountLabel>Base fare</RideDiscountLabel>
									<ServiceFee>
										{`${showPrice(
											currentOrder?.grandTotal - currentOrder?.tip || 0
										)}`}
									</ServiceFee>
								</Flex>
							)}
							{currentOrder?.tip > 0 && (
								<Flex justify='space-between' miw={200}>
									<RideDiscountLabel>Service fee</RideDiscountLabel>
									<ServiceFee>
										{`${showPrice(currentOrder?.tip || 0)}`}
									</ServiceFee>
								</Flex>
							)}
							{currentOrder?.appliedVoucherAmount > 0 && (
								<Flex justify='space-between' miw={200}>
									<RideDiscountLabel>Discount</RideDiscountLabel>
									<RideDiscountAmount>
										{`- ${showPrice(currentOrder?.appliedVoucherAmount || 0)}`}
									</RideDiscountAmount>
								</Flex>
							)}
							<Flex justify='space-between' miw={200}>
								<RideAmountLabel>
									{orderCanceled
										? "Ride amount"
										: `Amount ${
												currentOrder?.orderType ===
													PAYMENT_METHOD.PAY_LATER.value &&
												currentOrder?.paymentStatus !== "SUCCESS"
													? "due"
													: "paid"
										  }`}
								</RideAmountLabel>
								<RideAmountLabel>
									{showPrice(currentOrder?.grandTotal || 0)}
								</RideAmountLabel>
							</Flex>
						</RideInfoContainer>
					</>
				</Grid.Col>
			</Grid>
		</RideStatusContainer>
	)
}

export default RideStatus
