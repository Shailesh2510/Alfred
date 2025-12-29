import { ActionIcon, Flex, Grid, Skeleton, Timeline } from "@mantine/core"
import {
	IconArrowLeft,
	IconCheck,
	IconCircleCheck,
	IconX
} from "@tabler/icons-react"
import { useRouter } from "next/router"
import useOrder from "@/hooks/order/useOrder"
import { ORDER_STATUS, PAYMENT_METHOD } from "@/shared-constants"
import Pusher from "pusher-js"
import { ORDER_CHANNEL, ORDER_STATUS_UPDATED_EVENT } from "@/shared-constants"
import useHotels from "@/hooks/hotel/useHotels"
import useCreateReferralRecord from "@/hooks/referral/useCreateReferralRecord"
import React, { useEffect, useState } from "react"
import { find, toNumber } from "lodash"
import { StyledDivider } from "@/design-components"
import { showPrice, customNotification } from "@/shared-utils"

import {
	GoBackToCart,
	OrderStatusContainer,
	OrderStatusChildContainer,
	StyledTimelineItem,
	OrderCanceledMessage,
	OrderSuccessMessage,
	FieldLabel,
	FieldValue,
	OrderInfoContainer,
	OrderInfoLabel,
	OrderAmountLabel,
	OrderModifierInfoLabel,
	OrderModifierInfoValue
} from "./order-status.style"
import useGlobalStore from "@/globalStore/globalStore"
import { format, parseISO } from "date-fns"

const getActiveTimelineItemIndex = (status: string) => {
	switch (status) {
		case ORDER_STATUS.PENDING.value || ORDER_STATUS.INITIATED.value:
			return 0
		case ORDER_STATUS.CONFIRMED.value:
			return 1
		case ORDER_STATUS.PREPARATION.value:
			return 2
		case ORDER_STATUS.IN_DELIVERY.value:
			return 3
		case ORDER_STATUS.DELIVERED.value:
			return 4
		case ORDER_STATUS.CANCELED.value:
			return 5
		default:
			return 0
	}
}

const OrderStatus = () => {
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

	useEffect(() => {
		const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string
		})

		const channel = pusher.subscribe(ORDER_CHANNEL)
		channel.bind(ORDER_STATUS_UPDATED_EVENT, (order: any) => {
			if (order.nonce === orderId) {
				refetchOrder()
			}
		})
		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [orderId])

	const orderCanceled = currentOrder?.status === ORDER_STATUS.CANCELED.value

	const serviceFee = showPrice(
		(toNumber(currentOrder?.deliveryFee) ?? 0) +
			(currentHotelDetails?.enableAutomaticTip &&
			toNumber(currentOrder?.tip) > 0
				? toNumber(currentOrder?.tip)
				: 0)
	)

	return (
		<OrderStatusContainer>
			<Flex align='center' direction='column' mt={50}>
				{orderCanceled ? (
					<>
						<IconX size={72} color='#ADB5BD' />
						<OrderCanceledMessage>Order canceled</OrderCanceledMessage>
					</>
				) : (
					<>
						{orderStatus === "success" && (
							<>
								<IconCircleCheck size={72} color='#69DB7C' />
								<OrderSuccessMessage>Order created</OrderSuccessMessage>
							</>
						)}
					</>
				)}
				{currentOrder?.scheduledDate && (
					<Flex align='center' justify='center'>
						<OrderAmountLabel>Scheduled for:&nbsp;</OrderAmountLabel>
						<OrderAmountLabel>
							{format(parseISO(currentOrder?.scheduledDate), "MM/dd h:mm a")}
						</OrderAmountLabel>
					</Flex>
				)}
				{order?.id && (
					<Flex align='center' justify='center'>
						<FieldLabel>Order ID:&nbsp;</FieldLabel>
						<FieldValue>{order?.id}</FieldValue>
					</Flex>
				)}
				{currentOrder?.hotelName && (
					<Flex align='center' justify='center' mb={24}>
						<FieldLabel>Hotel:&nbsp;</FieldLabel>
						<FieldValue>{currentOrder?.hotelName}</FieldValue>
					</Flex>
				)}
			</Flex>
			<Grid>
				<Grid.Col
					offsetXs={1}
					offsetSm={1}
					offsetMd={2}
					offsetLg={3}
					offsetXl={3}
				>
					<Flex align='center' mb={12}>
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
				</Grid.Col>
				<Grid.Col
					offsetXs={1}
					xs={10}
					offsetSm={1}
					sm={5}
					offsetMd={2}
					md={4}
					offsetLg={3}
					lg={3}
					offsetXl={3}
					xl={3}
				>
					{orderLoading ? (
						<Skeleton height={180} radius={8} />
					) : (
						<>
							<OrderInfoContainer>
								<Flex justify='space-between' miw={200}>
									<OrderInfoLabel>Payment type:</OrderInfoLabel>
									<OrderInfoLabel>
										{PAYMENT_METHOD[currentOrder?.orderType]?.label || ""}
									</OrderInfoLabel>
								</Flex>
								<Flex justify='space-between' miw={200}>
									<OrderInfoLabel>Room number:</OrderInfoLabel>
									<OrderInfoLabel>
										{currentOrder?.roomNumber || ""}
									</OrderInfoLabel>
								</Flex>
								<Flex justify='space-between' miw={200}>
									<OrderInfoLabel>Email:</OrderInfoLabel>
									<OrderInfoLabel>
										{currentOrder?.clientEmail || ""}
									</OrderInfoLabel>
								</Flex>
							</OrderInfoContainer>
							<OrderInfoContainer>
								{currentOrder?.items?.map((item: any) => (
									<>
										<Flex justify='space-between' miw={200} key={item?.id}>
											<OrderInfoLabel>{`${item.itemName} (x${item.quantity})`}</OrderInfoLabel>
											<OrderInfoLabel>{showPrice(item?.price)}</OrderInfoLabel>
										</Flex>
										<>
											{item?.modifiers?.map((modifier: any) => (
												<>
													{modifier?.options?.map((option: any) => (
														<Flex justify='space-between' key={option?.id}>
															<OrderModifierInfoLabel>{`${option.modifierOptionName} (x${option.quantity})`}</OrderModifierInfoLabel>
															<OrderModifierInfoValue>
																{showPrice(option?.price)}
															</OrderModifierInfoValue>
														</Flex>
													))}
												</>
											))}
										</>
									</>
								))}
								<StyledDivider my={8} />
								<Flex justify='space-between' miw={200}>
									<OrderInfoLabel>Subtotal</OrderInfoLabel>
									<OrderInfoLabel>
										{showPrice(currentOrder?.receiptAmount || 0)}
									</OrderInfoLabel>
								</Flex>
								<Flex justify='space-between' miw={200}>
									<OrderInfoLabel>Service fee</OrderInfoLabel>
									<OrderInfoLabel>{serviceFee}</OrderInfoLabel>
								</Flex>
								<Flex justify='space-between' miw={200}>
									<OrderInfoLabel>Tax</OrderInfoLabel>
									<OrderInfoLabel>
										{showPrice(currentOrder?.taxAmount || 0)}
									</OrderInfoLabel>
								</Flex>
								{currentOrder?.appliedVoucherAmount > 0 && (
									<Flex justify='space-between' miw={200}>
										<OrderInfoLabel>Discount</OrderInfoLabel>
										<OrderInfoLabel>
											{showPrice(currentOrder?.appliedVoucherAmount || 0)}
										</OrderInfoLabel>
									</Flex>
								)}
								{!currentHotelDetails?.enableAutomaticTip && (
									<Flex justify='space-between' miw={200}>
										<OrderInfoLabel>Tip</OrderInfoLabel>
										<OrderInfoLabel>
											{showPrice(currentOrder?.tip || 0)}
										</OrderInfoLabel>
									</Flex>
								)}
								<Flex justify='space-between' miw={200}>
									<OrderAmountLabel>
										{orderCanceled ? "Order amount" : "Amount paid"}
									</OrderAmountLabel>
									<OrderAmountLabel>
										{showPrice(currentOrder?.grandTotal || 0)}
									</OrderAmountLabel>
								</Flex>
							</OrderInfoContainer>
						</>
					)}
				</Grid.Col>
				<Grid.Col
					offsetXs={1}
					xs={10}
					offsetSm={0}
					sm={5}
					offsetMd={0}
					md={4}
					offsetLg={0}
					lg={3}
					offsetXl={0}
					xl={3}
				>
					{orderLoading ? (
						<Skeleton height={300} radius={8} />
					) : (
						<OrderStatusChildContainer>
							<Timeline
								w='100%'
								lineWidth={2}
								bulletSize={24}
								active={getActiveTimelineItemIndex(currentOrder?.status)}
								color={orderCanceled ? "gray.5" : "green.5"}
							>
								<StyledTimelineItem
									bullet={<IconCheck size={16} />}
									title='Order placed'
								>
									<div>We have received your order</div>
								</StyledTimelineItem>
								<StyledTimelineItem
									bullet={<IconCheck size={16} />}
									title='Order confirmed'
								>
									<div>Your order has been confirmed</div>
								</StyledTimelineItem>
								<StyledTimelineItem
									bullet={<IconCheck size={16} />}
									title='Order processed'
								>
									<div>We are preparing your order</div>
								</StyledTimelineItem>
								<StyledTimelineItem
									bullet={<IconCheck size={16} />}
									title='In delivery'
								>
									<div>Your order is on the way </div>
								</StyledTimelineItem>
								<StyledTimelineItem
									bullet={<IconCheck size={16} />}
									title='Delivered'
								>
									<div>Enjoy your food!</div>
								</StyledTimelineItem>
							</Timeline>
						</OrderStatusChildContainer>
					)}
				</Grid.Col>
			</Grid>
		</OrderStatusContainer>
	)
}

export default OrderStatus
