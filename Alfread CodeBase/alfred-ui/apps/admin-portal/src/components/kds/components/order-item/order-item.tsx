import React, { useEffect, useState } from "react"
import { Divider, Flex } from "@mantine/core"
import {
	CANCEL_ORDER_DROPDOWN_OPTIONS,
	ORDER_STATUS,
	OrderStatusType
} from "@/shared-constants"
import {
	StyledButton,
	StyledModal,
	StyledSelect,
	StyledTextarea
} from "@/design-components"
import { useInputState } from "@mantine/hooks"
import { createDateFromString, longDateFormat } from "@/shared-utils"
import { differenceInMinutes } from "date-fns"
import { customNotification } from "@/shared-utils"
import useChangeStatusToCanceled from "@/hooks/order/useChangeStatusToCanceled"
import useChangeStatusToConfirmed from "@/hooks/order/useChangeStatusToConfirmed"
import useChangeStatusToInPreparation from "@/hooks/order/useChangeStatusToInPreparation"
import useChangeStatusToDelivered from "@/hooks/order/useChangeStatusToDelivered"
import useChangeStatusToInDelivery from "@/hooks/order/useChangeStatusToInDelivery"
import useChangeStatusToPending from "@/hooks/order/useChangeStatusToPending"
import { formatInTimeZone } from "date-fns-tz"
import {
	OrderContainer,
	OrderFooter,
	OrderHeader,
	OrderID,
	OrderStatus,
	OrderDetailContainer,
	OrderTimeContainer,
	OrderTime,
	OrderTimeLabel,
	OrderCommentContainer,
	OrderCommentTitle,
	OrderComment,
	OrderBodyContainer,
	HotelName,
	HotelAddress,
	GuestName,
	MerchantAddress,
	MerchantName,
	RoomNumber,
	OrderIDStatusContainer
} from "./order-item.style"

const getOrderStatusLabel = (status: OrderStatusType) => {
	if (status === ORDER_STATUS.PREPARATION.value) {
		return "Waiting for pickup"
	}
	return ORDER_STATUS?.[status]?.label
}

interface OrderProps {
	orderId: string
	orderNonce: string
	orderItems?: any[]
	hotelId: string
	hotelName: string
	merchantName: string
	version: number
	clientName?: string
	merchantAddressNumber?: string
	merchantAddressStreet?: string
	merchantAddressTown?: string
	merchantAddressZipCode?: string
	status: OrderStatusType
	comment?: string
	cancelReason?: string
	cancelOption?: string
	orderDate: string
	timezone: string
	roomNumber?: string
	scheduledDate?: string
	numberOfCutleries?: number
	hotelAddressNumber?: string
	hotelAddressStreet?: string
	hotelAddressTown?: string
	hotelAddressZipCode?: string
	hasThirdPartyDelivery: boolean
	merchantColor?: string
}

const Order: React.FC<OrderProps> = ({
	orderId,
	hotelId,
	orderNonce,
	clientName,
	merchantName,
	merchantAddressNumber,
	merchantAddressStreet,
	merchantAddressTown,
	merchantAddressZipCode,
	version,
	status,
	comment,
	cancelReason,
	cancelOption,
	orderDate,
	timezone,
	roomNumber,
	scheduledDate,
	hotelAddressNumber,
	hotelAddressStreet,
	hotelName,
	hotelAddressTown,
	hotelAddressZipCode,
	hasThirdPartyDelivery,
	merchantColor
}) => {
	const [orderTime, setOrderTime] = useState(0)
	const [cancelComment, setCancelComment] = useInputState("")
	const [showCancelModal, setShowCancelModal] = useState(false)
	const [cancelDropDownOption, setCancelDropDownOption] = useInputState("")

	const { mutate: changeStatusToCanceled } = useChangeStatusToCanceled({
		onSuccess: () => {
			customNotification.success({
				title: "Order status",
				message: "Order canceled successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Order status",
				message: "Order cancelation failed"
			})
		}
	})

	const { mutate: changeStatusToConfirmed } = useChangeStatusToConfirmed({
		onSuccess: () => {
			customNotification.success({
				title: "Order status",
				message: "Order status changed to 'confirmed' successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Order status",
				message: "Order status change failed"
			})
		}
	})

	const { mutate: changeStatusToInPreparation } =
		useChangeStatusToInPreparation({
			onSuccess: () => {
				customNotification.success({
					title: "Order status",
					message: "Order status changed to 'in preparation' successfully"
				})
			},
			onError: () => {
				customNotification.error({
					title: "Order status",
					message: "Order status change failed"
				})
			}
		})

	const { mutate: changeStatusToInDelivery } = useChangeStatusToInDelivery({
		onSuccess: () => {
			customNotification.success({
				title: "Order status",
				message: "Order status changed to 'in delivery' successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Order status",
				message: "Order status change failed"
			})
		}
	})

	const { mutate: changeStatusToDelivered } = useChangeStatusToDelivered({
		onSuccess: () => {
			customNotification.success({
				title: "Order status",
				message: "Order status changed to 'delivered' successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Order status",
				message: "Order status change failed"
			})
		}
	})

	const { mutate: changeStatusToPending } = useChangeStatusToPending({
		onSuccess: () => {
			customNotification.success({
				title: "Order status",
				message: "Order status changed to 'pending' successfully"
			})
		},
		onError: () => {
			customNotification.error({
				title: "Order status",
				message: "Order status change failed"
			})
		}
	})

	useEffect(() => {
		const setTime = () => {
			if (!orderDate) {
				return
			}

			setOrderTime(
				differenceInMinutes(new Date(), createDateFromString(orderDate))
			)
		}

		setTime()
		const interval = setInterval(setTime, 60000)

		return () => clearInterval(interval)
	}, [orderDate])

	let formattedScheduledDate = ""

	if (scheduledDate) {
		formattedScheduledDate = formatInTimeZone(
			scheduledDate,
			timezone,
			longDateFormat
		)
	}

	const handleOrderClick = () => {
		window.open(`/order-list/${orderId}`, "_blank")
	}

	const getOrderItemActions = () => {
		switch (status) {
			case ORDER_STATUS.INITIATED.value:
				return null

			case ORDER_STATUS.PENDING.value:
				return (
					<OrderFooter>
						<Flex gap={16} align='center' justify='center'>
							<StyledButton
								variant='outline'
								color='red.7'
								w='100%'
								onClick={() => setShowCancelModal(true)}
							>
								Reject
							</StyledButton>
							<StyledButton
								variant='filled'
								color='indigo.9'
								w='100%'
								onClick={() =>
									changeStatusToConfirmed({ orderId, version, hotelId })
								}
							>
								Accept
							</StyledButton>
						</Flex>
					</OrderFooter>
				)
			case ORDER_STATUS.CONFIRMED.value:
				return (
					<OrderFooter>
						<Flex gap={16} align='center' justify='center'>
							<StyledButton
								variant='filled'
								color='indigo.7'
								w='100%'
								onClick={() =>
									changeStatusToInPreparation({ orderId, version, hotelId })
								}
							>
								Start preparation
							</StyledButton>
						</Flex>
					</OrderFooter>
				)
			case ORDER_STATUS.PREPARATION.value:
				return (
					<OrderFooter>
						<Flex gap={16} align='center' justify='center'>
							<StyledButton
								variant='outline'
								color='red.7'
								w='100%'
								onClick={() => setShowCancelModal(true)}
							>
								Cancel
							</StyledButton>
							<StyledButton
								variant='filled'
								color='indigo.7'
								w='100%'
								onClick={() =>
									changeStatusToInDelivery({ orderId, version, hotelId })
								}
							>
								Finish
							</StyledButton>
						</Flex>
					</OrderFooter>
				)
			case ORDER_STATUS.SCHEDULED.value:
				return (
					<OrderFooter>
						<Flex gap={16} align='center' justify='center'>
							<StyledButton
								variant='outline'
								color='red.7'
								w='100%'
								onClick={() => setShowCancelModal(true)}
							>
								Cancel
							</StyledButton>
							<StyledButton
								variant='filled'
								color='indigo.7'
								w='100%'
								onClick={() =>
									changeStatusToPending({ orderId, version, hotelId })
								}
							>
								Move to Pending
							</StyledButton>
						</Flex>
					</OrderFooter>
				)
			case ORDER_STATUS.IN_DELIVERY.value:
				return (
					<>
						{!hasThirdPartyDelivery && (
							<OrderFooter>
								<Flex gap={16} align='center' justify='center'>
									<StyledButton
										variant='filled'
										color='indigo.7'
										w='100%'
										onClick={() =>
											changeStatusToDelivered({ orderId, version, hotelId })
										}
									>
										Order delivered
									</StyledButton>
								</Flex>
							</OrderFooter>
						)}
					</>
				)
			case ORDER_STATUS.DELIVERED.value:
			case ORDER_STATUS.CANCELED.value:
				return null
			default:
				return null
		}
	}

	return (
		<OrderContainer status={status} merchantColor={merchantColor}>
			<OrderHeader status={status} merchantColor={merchantColor}>
				<OrderDetailContainer>
					<OrderIDStatusContainer>
						<OrderID>#{orderNonce}</OrderID>
						<Divider orientation='vertical' mr={8} m='auto' ml={8} h={16} />
						<OrderStatus>{getOrderStatusLabel(status)}</OrderStatus>
					</OrderIDStatusContainer>
					<OrderTimeContainer>
						<OrderTime>{orderTime}</OrderTime>
						<OrderTimeLabel>mins ago</OrderTimeLabel>
					</OrderTimeContainer>
				</OrderDetailContainer>
				{formattedScheduledDate && (
					<OrderTimeContainer>
						<OrderComment>Scheduled for :</OrderComment>
						<OrderTimeLabel>{formattedScheduledDate}</OrderTimeLabel>
					</OrderTimeContainer>
				)}
			</OrderHeader>
			<OrderBodyContainer onClick={handleOrderClick}>
				{hotelAddressNumber &&
					hotelAddressStreet &&
					hotelAddressTown &&
					hotelAddressZipCode && (
						<OrderCommentContainer>
							<OrderCommentTitle>Hotel Details: </OrderCommentTitle>
							<HotelName>{`${hotelName}`}</HotelName>
							<HotelAddress>
								{`${hotelAddressNumber}, ${hotelAddressStreet}, ${hotelAddressTown}, ${hotelAddressZipCode}`}
							</HotelAddress>
						</OrderCommentContainer>
					)}
				{merchantAddressNumber &&
					merchantAddressStreet &&
					merchantAddressTown &&
					merchantAddressZipCode && (
						<OrderCommentContainer>
							<OrderCommentTitle>Merchant Details:</OrderCommentTitle>
							<MerchantName>{`${merchantName}`}</MerchantName>
							<MerchantAddress>
								{`${merchantAddressNumber}, ${merchantAddressStreet}, ${merchantAddressTown}, ${merchantAddressZipCode}`}
							</MerchantAddress>
						</OrderCommentContainer>
					)}
				{roomNumber && clientName && (
					<OrderCommentContainer>
						<OrderCommentTitle>Guest Details:</OrderCommentTitle>
						<GuestName>{clientName}</GuestName>
						<RoomNumber>{roomNumber}</RoomNumber>
					</OrderCommentContainer>
				)}

				{(comment || comment === "") && (
					<OrderCommentContainer>
						<OrderCommentTitle>Comment:</OrderCommentTitle>
						<OrderComment>{comment ? comment : "-"}</OrderComment>
					</OrderCommentContainer>
				)}
			</OrderBodyContainer>
			{cancelReason && (
				<OrderCommentContainer>
					<OrderCommentTitle>Cancel reason:</OrderCommentTitle>
					<OrderComment>{cancelReason}</OrderComment>
				</OrderCommentContainer>
			)}
			{cancelOption && (
				<OrderCommentContainer>
					<OrderCommentTitle>Cancel option:</OrderCommentTitle>
					<OrderComment>{cancelOption}</OrderComment>
				</OrderCommentContainer>
			)}
			{getOrderItemActions()}
			<StyledModal
				size='lg'
				opened={showCancelModal}
				title={`Cancel order ${orderId}`}
				onClose={() => {
					setShowCancelModal(false)
					setCancelComment("")
				}}
				modalBody={
					<Flex direction='column' rowGap={16}>
						<StyledTextarea
							required
							label='Add comment'
							placeholder='Add a comment for the order cancelation'
							onChange={setCancelComment}
						/>
						<StyledSelect
							required
							label='Select reason'
							value={cancelDropDownOption}
							placeholder='Select an option'
							onChange={setCancelDropDownOption}
							data={CANCEL_ORDER_DROPDOWN_OPTIONS}
						/>
					</Flex>
				}
				modalFooter={
					<Flex justify='space-between'>
						<StyledButton
							color='dark'
							variant='outline'
							onClick={() => {
								setShowCancelModal(false)
							}}
						>
							Close
						</StyledButton>
						<StyledButton
							color='red'
							disabled={!cancelComment || !cancelDropDownOption}
							onClick={() => {
								changeStatusToCanceled({
									orderId,
									hotelId,
									version,
									cancelReason: cancelComment,
									cancelOption: cancelDropDownOption
								})
								setShowCancelModal(false)
							}}
						>
							Cancel order
						</StyledButton>
					</Flex>
				}
			/>
		</OrderContainer>
	)
}

export default Order
