import { PageStructure } from "@/shared-components"
import { Divider, Flex, Grid, Loader } from "@mantine/core"
import {
	StyledButton,
	StyledContainerWithTitle,
	StyledDivider,
	StyledModal,
	StyledSelect,
	StyledTextarea
} from "@/design-components"
import useOrder from "@/hooks/order/useOrder"
import { useRouter } from "next/router"
import {
	CANCEL_ORDER_DROPDOWN_OPTIONS,
	MERCHANT_TYPE_RIDES,
	MERCHANT_TYPE_ROOM_SERVICE,
	ORDER_STATUS,
	OrderStatusType,
	PAYMENT_METHOD,
	VOUCHER_TYPES
} from "@/shared-constants"
import {
	createDateFromString,
	customNotification,
	formatDate,
	getVoucherLabel,
	showPrice,
	convertTo12Hour
} from "@/shared-utils"
import {
	OrderContainer,
	FieldLabel,
	FieldValue,
	OrderItemQuantity,
	OrderItemLabel,
	OrderItemPrice,
	OrderModifierLabel,
	OrderModifierOptionLabel,
	OrderModifierOptionQuantity,
	OrderModifierOptionPrice,
	OrderSubtotal,
	OrderTax,
	OrderTotal,
	OrderCommentLabel,
	OrderComment,
	OrderDiscountAmount,
	VoucherFieldValue,
	VoucherFieldLabel
} from "./order-details.style"
import Link from "next/link"
import { IconCreditCardRefund, IconReceiptRefund } from "@tabler/icons-react"
import { useInputState } from "@mantine/hooks"
import RefundModal from "./components/refund-modal/refund-modal"
import { includes, toNumber } from "lodash"
import { useState } from "react"
import useChangeStatusToCanceled from "@/hooks/order/useChangeStatusToCanceled"
import useChangeStatusToInDelivery from "@/hooks/order/useChangeStatusToInDelivery"
import useChangeStatusToDelivered from "@/hooks/order/useChangeStatusToDelivered"
import RefundVoucherModal from "./components/refund-voucher-modal/refund-voucher-modal"

const Order = () => {
	const router = useRouter()

	const [cancelComment, setCancelComment] = useInputState("")
	const [showCancelModal, setShowCancelModal] = useState(false)
	const [cancelDropDownOption, setCancelDropDownOption] = useInputState("")
	const [refundModalOpen, setRefundModalOpen] = useInputState<boolean>(false)
	const [refundVoucherModalOpen, setRefundVoucherModalOpen] =
		useInputState<boolean>(false)

	const orderId = router?.query?.id

	const {
		data: order,
		isLoading: orderLoading,
		refetch: refetchOrder
	} = useOrder(
		{ orderId },
		{
			enabled: !!orderId
		}
	)

	const currentOrder = order?.data?.[0]
	const getOrderStatusLabel = (status: OrderStatusType) => {
		if (status === ORDER_STATUS.PREPARATION.value) {
			return "Waiting for pickup"
		}
		return ORDER_STATUS?.[status]?.label
	}
	const { mutate: changeStatusToCanceled } = useChangeStatusToCanceled({
		onSuccess: () => {
			customNotification.success({
				title: "Order status",
				message: "Order canceled successfully"
			})
			refetchOrder()
		},
		onError: () => {
			customNotification.error({
				title: "Order status",
				message: "Order cancelation failed"
			})
		}
	})

	const { mutate: changeStatusToInDelivery } = useChangeStatusToInDelivery({
		onSuccess: () => {
			customNotification.success({
				title: "Order status",
				message: "Order status changed to 'in delivery' successfully"
			})
			refetchOrder()
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
			refetchOrder()
		},
		onError: () => {
			customNotification.error({
				title: "Order status",
				message: "Order status change failed"
			})
		}
	})

	return (
		<PageStructure
			goBack
			title={`Order #${currentOrder?.nonce ? currentOrder?.nonce : ""}`}
			headerContent={
				<Flex gap={16} mr={8} align='center'>
					{includes([ORDER_STATUS.PREPARATION.value], currentOrder?.status) && (
						<StyledButton
							color='green'
							onClick={() =>
								changeStatusToInDelivery({
									orderId,
									hotelId: currentOrder?.hotelId,
									version: currentOrder?.version
								})
							}
						>
							{`Change status to '${ORDER_STATUS?.IN_DELIVERY.label}'`}
						</StyledButton>
					)}
					{includes([ORDER_STATUS.IN_DELIVERY.value], currentOrder?.status) && (
						<StyledButton
							color='green'
							onClick={() =>
								changeStatusToDelivered({
									orderId,
									hotelId: currentOrder?.hotelId,
									version: currentOrder?.version
								})
							}
						>
							{`Change status to '${ORDER_STATUS?.DELIVERED.label}'`}
						</StyledButton>
					)}
					{includes(
						[
							ORDER_STATUS.SCHEDULED.value,
							ORDER_STATUS.PENDING.value,
							ORDER_STATUS.CONFIRMED.value
						],
						currentOrder?.status
					) && (
						<StyledButton
							variant='outline'
							color='red.7'
							onClick={() => setShowCancelModal(true)}
						>
							Cancel order
						</StyledButton>
					)}
					{includes(
						[ORDER_STATUS.CANCELED.value, ORDER_STATUS.DELIVERED.value],
						currentOrder?.status
					) &&
						currentOrder?.appliedVoucherAmount > 0 && (
							<StyledButton
								color='dark'
								variant='outline'
								disabled={
									currentOrder?.voucherType !== VOUCHER_TYPES.PER_DIEM.value
								}
								leftIcon={<IconReceiptRefund size={22} color='black' />}
								onClick={() => setRefundVoucherModalOpen(true)}
							>
								Refund voucher
							</StyledButton>
						)}
					{includes(
						[ORDER_STATUS.CANCELED.value, ORDER_STATUS.DELIVERED.value],
						currentOrder?.status
					) && currentOrder?.orderType === PAYMENT_METHOD.CREDIT_CARD.value ? (
						<StyledButton
							color='dark'
							variant='outline'
							leftIcon={<IconCreditCardRefund size={22} color='black' />}
							onClick={() => setRefundModalOpen(true)}
						>
							Refund order
						</StyledButton>
					) : null}
				</Flex>
			}
			pageContent={
				<>
					{orderLoading ? (
						<Flex mih={600} w='100%' justify='center' align='center'>
							<Loader />
						</Flex>
					) : (
						<OrderContainer>
							<Grid mb={24}>
								<Grid.Col lg={12}>
									<StyledContainerWithTitle title='Order Information'>
										<Flex rowGap={12} direction='column'>
											<Flex wrap='wrap' columnGap={8} rowGap={12}>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Status</FieldLabel>
													<FieldValue>
														{getOrderStatusLabel(currentOrder?.status)}
													</FieldValue>
												</Flex>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Order date</FieldLabel>
													<FieldValue>
														{formatDate(
															createDateFromString(currentOrder?.orderDate)
														)}
													</FieldValue>
												</Flex>
												{currentOrder.merchantType ===
												MERCHANT_TYPE_ROOM_SERVICE ? (
													<Flex direction='column' columnGap={8} mr={80}>
														<FieldLabel>Room number</FieldLabel>
														<FieldValue>{currentOrder?.roomNumber}</FieldValue>
													</Flex>
												) : null}
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Hotel</FieldLabel>
													<FieldValue>{currentOrder?.hotelName}</FieldValue>
												</Flex>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Merchant</FieldLabel>
													<FieldValue>{currentOrder?.merchantName}</FieldValue>
												</Flex>
												{currentOrder.merchantType ===
												MERCHANT_TYPE_ROOM_SERVICE ? (
													<>
														<Flex direction='column' columnGap={8} mr={80}>
															<FieldLabel>Meal Period</FieldLabel>
															<FieldValue>
																{currentOrder?.mealPeriodName}
															</FieldValue>
														</Flex>
														<Flex direction='column' columnGap={8} mr={80}>
															<FieldLabel>Cutleries & Napkins</FieldLabel>
															<FieldValue>
																{currentOrder?.numberOfCutleries || "-"}
															</FieldValue>
														</Flex>
													</>
												) : null}
											</Flex>
											<Flex>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Stripe</FieldLabel>
													{currentOrder?.stripeUrl ? (
														<Link
															href={currentOrder?.stripeUrl}
															target='_blank'
														>
															<StyledButton>Stripe</StyledButton>
														</Link>
													) : (
														"-"
													)}
												</Flex>
												{currentOrder.merchantType ===
												MERCHANT_TYPE_ROOM_SERVICE ? (
													<Flex direction='column' columnGap={8} mr={80}>
														<FieldLabel>Relay</FieldLabel>
														{currentOrder?.relayUrl ? (
															<Link
																href={currentOrder?.relayUrl}
																target='_blank'
															>
																<StyledButton>Relay</StyledButton>
															</Link>
														) : (
															"-"
														)}
													</Flex>
												) : null}
												{currentOrder.merchantType === MERCHANT_TYPE_RIDES ? (
													<>
														<Flex direction='column' columnGap={8} mr={80}>
															<FieldLabel>Scheduled date</FieldLabel>
															<FieldValue>
																{currentOrder?.relayResponse?.Trip?.tripDate}
															</FieldValue>
														</Flex>
														<Flex direction='column' columnGap={8} mr={80}>
															<FieldLabel>Scheduled time</FieldLabel>
															<FieldValue>
																{convertTo12Hour(
																	currentOrder?.relayResponse?.Trip?.tripTime
																)}
															</FieldValue>
														</Flex>
													</>
												) : null}
											</Flex>
										</Flex>
									</StyledContainerWithTitle>
								</Grid.Col>
							</Grid>
							<Grid mb={24}>
								<Grid.Col lg={12}>
									<StyledContainerWithTitle title='Guest Information'>
										<Flex wrap='wrap' columnGap={8}>
											<Flex direction='column' columnGap={8} mr={80}>
												<FieldLabel>Full name</FieldLabel>
												<FieldValue>{currentOrder?.clientName}</FieldValue>
											</Flex>
											<Flex direction='column' columnGap={8} mr={80}>
												<FieldLabel>Email</FieldLabel>
												<FieldValue>{currentOrder?.clientEmail}</FieldValue>
											</Flex>
											<Flex direction='column' columnGap={8} mr={80}>
												<FieldLabel>Phone number</FieldLabel>
												<FieldValue>{currentOrder?.clientNumber}</FieldValue>
											</Flex>
										</Flex>
									</StyledContainerWithTitle>
								</Grid.Col>
							</Grid>
							{currentOrder.merchantType === MERCHANT_TYPE_ROOM_SERVICE ? (
								<Grid mb={24}>
									<Grid.Col lg={12}>
										<StyledContainerWithTitle title='Relay message'>
											<Flex wrap='wrap' columnGap={8}>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Relay message</FieldLabel>
													<FieldValue>
														{currentOrder?.relayResponse?.message}
													</FieldValue>
												</Flex>
												{currentOrder?.relayResponse?.validationErrors
													?.length && (
													<Flex direction='column' columnGap={8} mr={80}>
														<FieldLabel>Validation errors</FieldLabel>
														{currentOrder?.relayResponse?.validationErrors?.map(
															(error: any, index: any) => (
																<FieldValue key={index}>
																	- {error?.message}
																</FieldValue>
															)
														)}
													</Flex>
												)}
											</Flex>
										</StyledContainerWithTitle>
									</Grid.Col>
								</Grid>
							) : (
								<Grid mb={24}>
									<Grid.Col lg={12}>
										<StyledContainerWithTitle title='Ride details'>
											<Flex wrap='wrap' columnGap={8}>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Car ID</FieldLabel>
													<FieldValue>
														{currentOrder?.relayResponse?.Trip?.car
															?.carClassID ?? "-"}
													</FieldValue>
												</Flex>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Car Description</FieldLabel>
													<FieldValue>
														{currentOrder?.relayResponse?.Trip?.car?.carID
															? `${currentOrder?.relayResponse?.Trip?.car?.carColor} ${currentOrder?.relayResponse?.Trip?.car?.carMake} ${currentOrder?.relayResponse?.Trip?.car?.carModel} | ${currentOrder?.relayResponse?.Trip?.car?.carPlateNum}`
															: "-"}
													</FieldValue>
												</Flex>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Pickup location</FieldLabel>
													<FieldValue>
														{currentOrder?.relayResponse
															? currentOrder?.relayResponse?.Trip?.addrPu
																	?.airport
																? currentOrder?.relayResponse?.Trip?.addrPu
																		?.airportCode
																: `${currentOrder?.relayResponse?.Trip?.addrPu?.streetNumber} ${currentOrder?.relayResponse?.Trip?.addrPu?.streetName} ${currentOrder?.relayResponse?.Trip?.addrPu?.cityName}`
															: "-"}
													</FieldValue>
												</Flex>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Drop location</FieldLabel>
													<FieldValue>
														{currentOrder?.relayResponse
															? currentOrder?.relayResponse?.Trip?.addrDo
																	?.airport
																? currentOrder?.relayResponse?.Trip?.addrDo
																		?.airportCode
																: `${currentOrder?.relayResponse?.Trip?.addrDo?.streetNumber} ${currentOrder?.relayResponse?.Trip?.addrDo?.streetName} ${currentOrder?.relayResponse?.Trip?.addrDo?.cityName}`
															: "-"}
													</FieldValue>
												</Flex>
											</Flex>
										</StyledContainerWithTitle>
									</Grid.Col>
								</Grid>
							)}
							<Grid>
								<Grid.Col lg={currentOrder?.appliedVoucherAmount > 0 ? 4 : 6}>
									<StyledContainerWithTitle title='Items Ordered'>
										<Flex rowGap={20} direction='column'>
											{currentOrder?.items.map((orderItem: any) => (
												<Flex
													key={orderItem?.id}
													direction='column'
													columnGap={8}
												>
													<Grid w='100%'>
														<Grid.Col span={10}>
															<Flex justify='flex-start'>
																<OrderItemQuantity>
																	{orderItem?.quantity}
																</OrderItemQuantity>
																<OrderItemLabel>
																	{orderItem?.itemName}
																</OrderItemLabel>
															</Flex>
														</Grid.Col>
														<Grid.Col span={2}>
															<Flex justify='flex-end'>
																<OrderItemPrice>
																	{showPrice(orderItem?.price)}
																</OrderItemPrice>
															</Flex>
														</Grid.Col>
													</Grid>
													<Flex direction='column'>
														{orderItem?.modifiers?.map((modifier: any) => (
															<Flex direction='column' key={modifier?.id}>
																<OrderModifierLabel>
																	{modifier?.modifierName}
																</OrderModifierLabel>
																{modifier?.options?.map((option: any) => (
																	<Grid w='100%' key={option?.id}>
																		<Grid.Col offset={1} span={9}>
																			<Flex justify='flex-start'>
																				<OrderModifierOptionQuantity>
																					{option?.quantity}
																				</OrderModifierOptionQuantity>
																				<OrderModifierOptionLabel>
																					{option?.modifierOptionName}
																				</OrderModifierOptionLabel>
																			</Flex>
																		</Grid.Col>
																		<Grid.Col span={2}>
																			<Flex justify='flex-end'>
																				<OrderModifierOptionPrice>
																					{showPrice(option?.price)}
																				</OrderModifierOptionPrice>
																			</Flex>
																		</Grid.Col>
																	</Grid>
																))}
															</Flex>
														))}
													</Flex>
												</Flex>
											))}
										</Flex>
										{currentOrder?.comment ? (
											<>
												<StyledDivider my={16} />
												<Flex direction='column'>
													<OrderCommentLabel>Comment:</OrderCommentLabel>
													<OrderComment>{currentOrder?.comment}</OrderComment>
												</Flex>
											</>
										) : null}
									</StyledContainerWithTitle>
								</Grid.Col>
								<Grid.Col lg={currentOrder?.appliedVoucherAmount > 0 ? 4 : 6}>
									<StyledContainerWithTitle title='Finances'>
										<Flex wrap='wrap' rowGap={12} direction='column'>
											<Flex justify='space-between'>
												<FieldLabel>Payment type</FieldLabel>
												<FieldValue>
													{PAYMENT_METHOD[currentOrder?.orderType]?.label}
												</FieldValue>
											</Flex>
											<Divider />
											{currentOrder.merchantType ===
											MERCHANT_TYPE_ROOM_SERVICE ? (
												<Flex justify='space-between'>
													<OrderSubtotal>Subtotal</OrderSubtotal>
													<OrderSubtotal>
														{showPrice(currentOrder?.receiptAmount)}
													</OrderSubtotal>
												</Flex>
											) : (
												<Flex justify='space-between'>
													<OrderSubtotal>Base fare</OrderSubtotal>
													<OrderSubtotal>
														{showPrice(
															currentOrder?.grandTotal - currentOrder?.tip
														)}
													</OrderSubtotal>
												</Flex>
											)}
											{currentOrder.merchantType ===
											MERCHANT_TYPE_ROOM_SERVICE ? (
												<>
													<Flex justify='space-between'>
														<OrderTax>Tax</OrderTax>
														<OrderTax>
															{showPrice(currentOrder?.taxAmount)}
														</OrderTax>
													</Flex>
													<Flex justify='space-between'>
														<OrderTax>Delivery fee</OrderTax>
														<OrderTax>
															{showPrice(currentOrder?.deliveryFee)}
														</OrderTax>
													</Flex>
												</>
											) : null}
											{currentOrder?.appliedVoucherAmount > 0 && (
												<Flex justify='space-between'>
													<OrderDiscountAmount>Discount</OrderDiscountAmount>
													<OrderDiscountAmount>
														{`- ${showPrice(
															currentOrder?.appliedVoucherAmount
														)}` || 0}
													</OrderDiscountAmount>
												</Flex>
											)}
											{currentOrder?.tip > 0 && (
												<Flex justify='space-between'>
													<OrderTax>
														{currentOrder?.merchantType ===
														MERCHANT_TYPE_ROOM_SERVICE
															? "Tip"
															: "Service fee"}
													</OrderTax>
													<OrderTax>{showPrice(currentOrder?.tip)}</OrderTax>
												</Flex>
											)}
											<Flex justify='space-between'>
												<OrderTotal>Total</OrderTotal>
												<OrderTotal>
													{showPrice(currentOrder?.grandTotal)}
												</OrderTotal>
											</Flex>
											{parseFloat(currentOrder?.refundAmount) > 0 && (
												<Flex columnGap={12}>
													<OrderTotal>Refunded amount: </OrderTotal>
													<OrderTotal>
														{showPrice(currentOrder?.refundAmount)}
													</OrderTotal>
												</Flex>
											)}
										</Flex>
									</StyledContainerWithTitle>
								</Grid.Col>
								{currentOrder?.voucherCode && (
									<Grid.Col lg={4}>
										<StyledContainerWithTitle title='Voucher Details'>
											<Flex wrap='wrap' rowGap={12} direction='column'>
												<Flex justify='space-between'>
													<VoucherFieldLabel>Code</VoucherFieldLabel>
													<VoucherFieldValue>
														{currentOrder?.voucherCode}
													</VoucherFieldValue>
												</Flex>
												<Flex justify='space-between'>
													<VoucherFieldLabel>Type</VoucherFieldLabel>
													<VoucherFieldValue>
														{getVoucherLabel(currentOrder?.voucherType)}
													</VoucherFieldValue>
												</Flex>
												<Flex justify='space-between'>
													<VoucherFieldLabel>Discount</VoucherFieldLabel>
													<VoucherFieldValue>
														{currentOrder?.voucherType === "DISCOUNT"
															? `${
																	currentOrder?.voucherPayerPercentage.split(
																		"."
																	)[0]
															  }%`
															: showPrice(currentOrder?.voucherTotalAmount)}
													</VoucherFieldValue>
												</Flex>
												<Flex justify='space-between'>
													<VoucherFieldLabel>Payee</VoucherFieldLabel>
													<VoucherFieldValue>
														{currentOrder?.voucherPayer}
													</VoucherFieldValue>
												</Flex>
											</Flex>
										</StyledContainerWithTitle>
									</Grid.Col>
								)}
							</Grid>
						</OrderContainer>
					)}
					<RefundModal
						orderId={orderId}
						refundModalOpen={refundModalOpen}
						setRefundModalOpen={setRefundModalOpen}
					/>
					{refundVoucherModalOpen ? (
						<RefundVoucherModal
							orderId={orderId}
							refundVoucherModalOpen={refundVoucherModalOpen}
							setRefundVoucherModalOpen={setRefundVoucherModalOpen}
							appliedVoucherAmount={toNumber(
								currentOrder?.appliedVoucherAmount
							)}
							refetchOrder={refetchOrder}
						/>
					) : null}
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
											cancelReason: cancelComment,
											hotelId: currentOrder?.hotelId,
											version: currentOrder?.version,
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
				</>
			}
		/>
	)
}

export default Order
