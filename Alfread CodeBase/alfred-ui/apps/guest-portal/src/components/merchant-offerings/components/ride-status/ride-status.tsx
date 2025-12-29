import { ActionIcon, Flex, Grid, Skeleton } from "@mantine/core"
import { IconArrowLeft, IconCircleCheck, IconX } from "@tabler/icons-react"
import { useRouter } from "next/router"
import useOrder from "@/hooks/order/useOrder"
import { ORDER_STATUS, PAYMENT_METHOD } from "@/shared-constants"
import useHotels from "@/hooks/hotel/useHotels"
import useCreateReferralRecord from "@/hooks/referral/useCreateReferralRecord"
import React, { useEffect, useState } from "react"
import { find } from "lodash"
import { showPrice, customNotification } from "@/shared-utils"
import useGlobalStore from "@/globalStore/globalStore"
import {
	FieldLabel,
	FieldValue,
	RideAmountLabel,
	RideCanceledMessage,
	RideConfirmedMessage,
	RideDiscountAmount,
	RideDiscountLabel,
	RideInfoContainer,
	RideInfoLabel,
	RideStatusContainer,
	RideSuccessMessage,
	ServiceFee
} from "./ride-status.style"
import { parseISO } from "date-fns"
import { GoBackToCart } from "@/components/order-page/order-page.style"
import { formatInTimeZone } from "date-fns-tz"

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

	const { data: hotels } = useHotels()

	const { setCurrentHotelDetails, currentHotelDetails } = useGlobalStore()

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
		const hotel = find(hotels, { id: currentOrder?.hotelUuid })
		if (hotel) {
			setCurrentHotelDetails(hotel)
		}
	}, [currentOrder?.hotelUuid, hotels])

	const orderCanceled = currentOrder?.status === ORDER_STATUS.CANCELED.value

	return (
		<RideStatusContainer>
			<Flex align='center' direction='column' mt={50}>
				{orderCanceled ? (
					<>
						<IconX size={72} color='#ADB5BD' />
						<RideCanceledMessage>Ride canceled</RideCanceledMessage>
					</>
				) : (
					<>
						{orderStatus === "success" && (
							<>
								<IconCircleCheck size={72} color='#69DB7C' />
								<RideSuccessMessage>Ride Scheduled</RideSuccessMessage>
								<RideConfirmedMessage>
									{`You'll receive SMS updates as your order progresses.`}
								</RideConfirmedMessage>
							</>
						)}
					</>
				)}
				{order?.id && (
					<Flex align='center' justify='center'>
						<FieldLabel>Ride ID:&nbsp;</FieldLabel>
						<FieldValue>{order?.id}</FieldValue>
					</Flex>
				)}
				{currentOrder?.hotelName && (
					<Flex align='center' justify='center'>
						<FieldLabel>From Hotel:&nbsp;</FieldLabel>
						<FieldValue>{currentOrder?.hotelName}</FieldValue>
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
				<Grid.Col xs={2} sm={5} md={4} lg={3} xl={3}>
					<Flex align='center' justify={"flex-start"} mb={12}>
						<ActionIcon
							onClick={() => {
								router.push(`/${currentOrder?.hotelWebCode}`)
							}}
							variant='transparent'
						>
							<IconArrowLeft />
						</ActionIcon>
						<GoBackToCart>Back to menu</GoBackToCart>
					</Flex>
					{orderLoading ? (
						<Skeleton height={180} radius={8} />
					) : (
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
									<RideInfoLabel>
										{currentOrder?.clientEmail || ""}
									</RideInfoLabel>
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
											{`- ${showPrice(
												currentOrder?.appliedVoucherAmount || 0
											)}`}
										</RideDiscountAmount>
									</Flex>
								)}
								<Flex justify='space-between' miw={200}>
									<RideAmountLabel>
										{orderCanceled ? "Ride amount" : "Amount paid"}
									</RideAmountLabel>
									<RideAmountLabel>
										{showPrice(currentOrder?.grandTotal || 0)}
									</RideAmountLabel>
								</Flex>
							</RideInfoContainer>
						</>
					)}
				</Grid.Col>
			</Grid>
		</RideStatusContainer>
	)
}

export default RideStatus
