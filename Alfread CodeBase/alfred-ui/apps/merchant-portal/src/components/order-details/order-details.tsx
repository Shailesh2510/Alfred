import { PageStructure } from "@/shared-components"
import { Divider, Flex, Grid, Loader } from "@mantine/core"
import { StyledContainerWithTitle, StyledDivider } from "@/design-components"
import useOrder from "@/hooks/order/useOrder"
import { useRouter } from "next/router"
import {
	ORDER_STATUS,
	OrderStatusType,
	PAYMENT_METHOD
} from "@/shared-constants"
import {
	createDateFromString,
	formatDate,
	getVoucherLabel,
	showPrice
} from "@/shared-utils"
import {
	OrderContainer,
	FieldLabel,
	FieldValue,
	OrderItemQuantity,
	OrderItemLabel,
	OrderModifierLabel,
	OrderModifierOptionLabel,
	OrderModifierOptionQuantity,
	OrderModifierOptionPrice,
	OrderSubtotal,
	OrderTax,
	OrderTotal,
	OrderCommentLabel,
	OrderComment,
	OrderItemPrice,
	OrderDiscountAmount,
	VoucherFieldLabel,
	VoucherFieldValue
} from "./order-details.style"

const Order = () => {
	const router = useRouter()

	const orderId = router?.query?.id

	const { data: order, isLoading: orderLoading } = useOrder(
		{ orderId },
		{
			enabled: !!orderId
		}
	)

	const currentOrder = order?.data?.[0]

	const getOrderStatusLabel = (status: OrderStatusType) => {
		return ORDER_STATUS?.[status]?.label
	}

	const handleGoBack = () => {
		router.push(`/order-list`)
	}

	return (
		<PageStructure
			goBack
			title={`Order #${currentOrder?.nonce ? currentOrder?.nonce : ""}`}
			handleGoBack={handleGoBack}
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
											<Flex direction='column' columnGap={8} mr={80}>
												<FieldLabel>Room number</FieldLabel>
												<FieldValue>{currentOrder?.roomNumber}</FieldValue>
											</Flex>
											<Flex direction='column' columnGap={8} mr={80}>
												<FieldLabel>Hotel</FieldLabel>
												<FieldValue>{currentOrder?.hotelName}</FieldValue>
											</Flex>
											<Flex direction='column' columnGap={8} mr={80}>
												<FieldLabel>Meal Period</FieldLabel>
												<FieldValue>{currentOrder?.mealPeriodName}</FieldValue>
											</Flex>
											<Flex direction='column' columnGap={8} mr={80}>
												<FieldLabel>Cutleries & Napkins</FieldLabel>
												<FieldValue>
													{currentOrder?.numberOfCutleries || "-"}
												</FieldValue>
											</Flex>
										</Flex>
									</StyledContainerWithTitle>
								</Grid.Col>
							</Grid>
							<Grid mb={24}>
								<Grid.Col lg={12}>
									<StyledContainerWithTitle title='Guest Information'>
										<Flex wrap='wrap' columnGap={8} rowGap={12}>
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
							{currentOrder?.cancelReason ? (
								<Grid mb={24}>
									<Grid.Col lg={12}>
										<StyledContainerWithTitle title='Cancel reason'>
											<Flex wrap='wrap' columnGap={8}>
												<Flex direction='column' columnGap={8} mr={80}>
													<FieldLabel>Reason:</FieldLabel>
													<FieldValue>{currentOrder?.cancelReason}</FieldValue>
												</Flex>
											</Flex>
										</StyledContainerWithTitle>
									</Grid.Col>
								</Grid>
							) : null}
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
											<Flex justify='space-between'>
												<OrderSubtotal>Subtotal</OrderSubtotal>
												<OrderSubtotal>
													{showPrice(currentOrder?.receiptAmount)}
												</OrderSubtotal>
											</Flex>
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
													<OrderTax>Tip</OrderTax>
													<OrderTax>{showPrice(currentOrder?.tip)}</OrderTax>
												</Flex>
											)}
											<Flex justify='space-between'>
												<OrderTotal>Total</OrderTotal>
												<OrderTotal>
													{showPrice(currentOrder?.grandTotal)}
												</OrderTotal>
											</Flex>
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
				</>
			}
		/>
	)
}

export default Order
