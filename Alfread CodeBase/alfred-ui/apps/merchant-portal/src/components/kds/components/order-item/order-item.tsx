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
import { useEffect, useState } from "react"
import { useInputState } from "@mantine/hooks"
import { createDateFromString, longDateFormat } from "@/shared-utils"
import { differenceInMinutes } from "date-fns"
import { customNotification } from "@/shared-utils"
import useChangeStatusToCanceled from "@/hooks/order/useChangeStatusToCanceled"
import useChangeStatusToConfirmed from "@/hooks/order/useChangeStatusToConfirmed"
import useChangeStatusToInPreparation from "@/hooks/order/useChangeStatusToInPreparation"
import useChangeStatusToDelivered from "@/hooks/order/useChangeStatusToDelivered"
import useChangeStatusToInDelivery from "@/hooks/order/useChangeStatusToInDelivery"
import { formatInTimeZone } from "date-fns-tz"
import {
	OrderBody,
	OrderContainer,
	OrderFooter,
	OrderHeader,
	OrderID,
	OrderStatus,
	OrderDetailContainer,
	OrderTimeContainer,
	OrderItemContainer,
	OrderTime,
	OrderTimeLabel,
	OrderCommentContainer,
	OrderCommentTitle,
	OrderComment,
	OrderItem,
	OrderItemName,
	OrderItemQuantity,
	OrderItemModifier,
	OrderItemModifierList,
	OrderItemModifierContainer,
	OrderItemModifierName,
	OrderItemModifierOptionList,
	OrderItemModifierOptionContainer,
	OrderItemModifierOptionName,
	OrderItemModifierOptionQuantity,
	OrderItemModifierOption,
	OrderIDStatusContainer
} from "./order-item.style"
import useChangeStatusToPending from "@/hooks/order/useChangeStatusToPending"

const getOrderStatusLabel = (status: OrderStatusType) => {
	return ORDER_STATUS?.[status]?.label
}

const getOrderItemActions = ({
	status,
	version,
	orderId,
	setShowCancelModal,
	changeStatusToConfirmed,
	changeStatusToInDelivery,
	changeStatusToDelivered,
	changeStatusToInPreparation,
	changeStatusToPending,
	hasThirdPartyDelivery
}: any) => {
	switch (status) {
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
							onClick={() => changeStatusToConfirmed({ orderId, version })}
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
							onClick={() => changeStatusToInPreparation({ orderId, version })}
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
							onClick={() => changeStatusToInDelivery({ orderId, version })}
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
							onClick={() => changeStatusToPending({ orderId, version })}
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
									onClick={() => changeStatusToDelivered({ orderId, version })}
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

const Order = ({
	orderId,
	orderNonce,
	orderItems,
	version,
	status,
	clientName,
	comment,
	cancelReason,
	cancelOption,
	orderDate,
	timezone,
	roomNumber,
	scheduledDate,
	numberOfCutleries,
	hasThirdPartyDelivery,
	hotelAddressNumber,
	hotelAddressStreet,
	hotelAddressTown,
	hotelAddressZipCode
}: any) => {
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
				message: "Order status changed to 'delievered' successfully"
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

	return (
		<OrderContainer status={status}>
			<OrderHeader status={status}>
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
			<OrderBody>
				{orderItems?.map((orderItem: any) => (
					<OrderItemContainer key={orderItem.id}>
						<OrderItem>
							<OrderItemQuantity>{orderItem.quantity}</OrderItemQuantity>
							<OrderItemName>{orderItem.itemName}</OrderItemName>
						</OrderItem>
						<OrderItemModifierList>
							{orderItem?.modifiers?.map((modifier: any) => (
								<OrderItemModifierContainer key={modifier?.id}>
									<OrderItemModifier>
										<OrderItemModifierName>
											{modifier.modifierName}
										</OrderItemModifierName>
									</OrderItemModifier>
									<OrderItemModifierOptionList>
										{modifier?.options?.map((modifierOption: any) => (
											<OrderItemModifierOptionContainer key={modifierOption.id}>
												<OrderItemModifierOption>
													<OrderItemModifierOptionQuantity>
														{modifierOption.quantity}
													</OrderItemModifierOptionQuantity>
													<OrderItemModifierOptionName>
														{modifierOption.modifierOptionName}
													</OrderItemModifierOptionName>
												</OrderItemModifierOption>
											</OrderItemModifierOptionContainer>
										))}
									</OrderItemModifierOptionList>
								</OrderItemModifierContainer>
							))}
						</OrderItemModifierList>
					</OrderItemContainer>
				))}
			</OrderBody>
			<OrderCommentContainer>
				<OrderCommentTitle>Cutleries & Napkins:</OrderCommentTitle>
				<OrderComment>{numberOfCutleries || "-"}</OrderComment>
			</OrderCommentContainer>
			{hotelAddressNumber &&
				hotelAddressStreet &&
				hotelAddressTown &&
				hotelAddressZipCode && (
					<OrderCommentContainer>
						<OrderCommentTitle>Hotel address:</OrderCommentTitle>
						<OrderComment>{`${hotelAddressNumber}, ${hotelAddressStreet}, ${hotelAddressTown}, ${hotelAddressZipCode}`}</OrderComment>
					</OrderCommentContainer>
				)}
			{clientName && (
				<OrderCommentContainer>
					<OrderCommentTitle>Guest Name :</OrderCommentTitle>
					<OrderComment>{clientName}</OrderComment>
				</OrderCommentContainer>
			)}
			{roomNumber && (
				<OrderCommentContainer>
					<OrderCommentTitle>Room number:</OrderCommentTitle>
					<OrderComment>{roomNumber}</OrderComment>
				</OrderCommentContainer>
			)}
			{comment && (
				<OrderCommentContainer>
					<OrderCommentTitle>Comment:</OrderCommentTitle>
					<OrderComment>{comment}</OrderComment>
				</OrderCommentContainer>
			)}
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
			{getOrderItemActions({
				status,
				version,
				orderId,
				setShowCancelModal,
				changeStatusToConfirmed,
				changeStatusToInDelivery,
				changeStatusToDelivered,
				changeStatusToInPreparation,
				changeStatusToPending,
				hasThirdPartyDelivery
			})}
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
