import {
	Accordion,
	ActionIcon,
	Flex,
	Grid,
	Image,
	CloseButton
} from "@mantine/core"
import {
	StyledButton,
	StyledDivider,
	StyledNumberInput,
	StyledTextInput
} from "@/design-components"
import CheckoutItem from "../checkout-item"
import {
	customNotification,
	longDateFormatWithTimezone,
	showPrice,
	validateCountryPhoneNumber,
	validateScheduleOrderTime
} from "@/shared-utils"
import { flatten, map, toNumber } from "lodash"
import calculateTotalPrice from "../../utils/calculateTotalPrice"
import CheckoutGuestForm from "../checkout-guest-form"
import {
	CheckoutContainer,
	EmptyCartContainer,
	EmptyCartLabel,
	CartSubtotalPrice,
	CartTaxAmount,
	CartTotalPrice,
	CartPriceContainer,
	DiscountAmount,
	CartDeliveryFee,
	CutleriesLabel,
	CartTip,
	OrderDetailsText,
	ConsentText,
	VoucherCodeText,
	VoucherAppliedContainer,
	VoucherInfoContainer,
	VoucherInfoContainerDetails
} from "./checkout.style"
import { StripeElementsOptionsMode, loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import React, { useEffect, useRef, useState } from "react"
import { ScheduledDate } from "../../order-page.style"
import { formatInTimeZone } from "date-fns-tz"
import {
	IconArrowLeft,
	IconCircleMinus,
	IconCirclePlus,
	IconCheck
} from "@tabler/icons-react"
import { cartActionTypes } from "@/components/order-page/reducers/cartReducerts"
import { useRouter } from "next/router"
import { useForm } from "@mantine/form"
import { EMAIL_VALIDATION_REGEX, PAYMENT_METHOD } from "@/shared-constants"
import usePaymentInit from "@/hooks/payment/usePaymentInit"
import useCreateOrder from "@/hooks/order/useCreateOrder"
import StripePaymentsElement from "../stripe-payment-element"
import useQueryString from "@/custom-hooks/useQueryString"
import useCancelOrder from "@/hooks/order/useCancelOrder"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string)

const Checkout = ({
	cartState,
	dispatchCart,
	setScheduleOrderModalOpen,
	fetchVoucher,
	voucherLoading
}: any) => {
	const router = useRouter()

	const [openAccordions, setOpenAccordions] = useState([
		"order-details",
		"account-information",
		"payment-information"
	])
	const [paymentEnabled, setPaymentEnabled] = useState(false)
	const [paymentInProgress, setPaymentInProgress] = useState(false)
	const [showPromoCodeInput, setShowPromoCodeInput] = useState(false)
	const paymentElementRef = useRef<any>(null)
	const voucher = cartState?.order?.voucher

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
		items: cartState?.order?.items,
		taxRate: cartState?.taxRate,
		isTaxExempt: cartState?.currentHotel?.isTaxExempt,
		deliveryFee: cartState?.currentHotel?.deliveryFee,
		hasDeliveryFee: 0,
		isMandatoryTipEnabled: false,
		isDeliveryInSamePlace: false
	})

	const stripeOptions: StripeElementsOptionsMode = {
		mode: "payment",
		amount: parseInt(totalPrice) * 100,
		currency: "usd",
		clientSecret: undefined,
		payment_method_types: ["card"]
	}

	const form = useForm({
		validateInputOnChange: true,
		initialValues: {
			clientName: cartState?.order?.clientName || "",
			clientNumber: cartState?.order?.clientNumber || "",
			clientEmail: cartState?.order?.clientEmail || "",
			orderType: cartState?.order?.orderType || "",
			comment: cartState?.order?.comment || ""
		},
		validate: {
			clientName: (value: string) =>
				value?.length < 2 ? "Please enter a valid name" : null,
			clientEmail: (value: string) =>
				EMAIL_VALIDATION_REGEX.test(value)
					? null
					: "Please enter a valid email",
			clientNumber: (value: string) => validateCountryPhoneNumber(value)
		}
	})

	const queryString = useQueryString()

	const { mutate: paymentInit, isLoading: paymentInitIsLoading } =
		usePaymentInit({
			onSuccess: (result: any) => {
				if (result?.data?.[0]?.clientSecret) {
					paymentElementRef.current?.submit(result?.data?.[0]?.clientSecret)
				} else {
					router.push(
						`/catering/order/${result?.data?.[0]?.orderId}?orderStatus=success`
					)
				}
			},
			onError: () => {
				customNotification.error({
					title: "Failure",
					message: "Something went wrong. Please try again"
				})
			}
		})
	const { mutate: cancelOrder } = useCancelOrder({
		onError: () => {
			customNotification.error({
				title: "Failure",
				message: "Something went wrong. Please try again"
			})
		}
	})

	const { mutate: createOrder, isLoading: createOrderIsLoading } =
		useCreateOrder({
			onSuccess: async (response: any) => {
				if (response?.nonce) {
					dispatchCart({
						type: cartActionTypes.SET_ORDER_ID,
						id: response?.nonce,
						orderId: response?.id
					})
					if (response?.order_type === PAYMENT_METHOD.CREDIT_CARD.value) {
						paymentInit({
							orderId: response?.nonce,
							amount: parseFloat(totalPrice) * 100,
							paymentMethodType: "card",
							clientName: cartState?.order?.clientName,
							clientNumber: `${cartState?.order?.clientNumber}`,
							clientEmail: cartState?.order?.clientEmail,
							isCateringOrder: true
						})
					} else {
						router.push(
							`/catering/order/${response?.nonce}?orderStatus=success`
						)
					}
				} else {
					customNotification.error({
						title: "Failure",
						message: "Something went wrong. Please try again"
					})
				}
			},
			onError: () => {
				customNotification.error({
					title: "Failure",
					message: "Something went wrong. Please try again"
				})
			}
		})

	useEffect(() => {
		if (parseFloat(totalPrice) === 0) {
			setPaymentEnabled(true)
		}
	}, [totalPrice])

	useEffect(() => {
		if (cartState?.order?.orderType === PAYMENT_METHOD.ROOM_CHARGE.value) {
			setPaymentEnabled(true)
		}
	}, [cartState?.order?.orderType])

	let formatedScheduledDate = ""

	if (cartState.order?.scheduledDate) {
		formatedScheduledDate = formatInTimeZone(
			cartState.order?.scheduledDate,
			cartState?.currentHotel?.timezone,
			longDateFormatWithTimezone
		)
	}

	const openOrderDetailsAccordion = () => {
		setOpenAccordions(["order-details"])
	}

	return (
		<CheckoutContainer>
			<Grid gutter={24} justify='center' align='center'>
				<Grid.Col xs={12} sm={8} md={6} lg={4} xl={3}>
					<Flex align='flex-start' mb={12} justify='space-between'>
						<ActionIcon
							onClick={() =>
								dispatchCart({
									type: cartActionTypes.SET_SHOW_CHECKOUT_PAGE,
									showCheckoutPage: false
								})
							}
							variant='transparent'
						>
							<IconArrowLeft />
						</ActionIcon>
						<OrderDetailsText>Your Order</OrderDetailsText>
					</Flex>
					<Accordion
						chevronPosition='right'
						variant='contained'
						sx={{ width: "100%" }}
						multiple={true}
						value={openAccordions}
						onChange={setOpenAccordions}
					>
						<Accordion.Item value='order-details'>
							<Accordion.Control>Order Details</Accordion.Control>
							<Accordion.Panel sx={{ backgroundColor: "white" }}>
								{formatedScheduledDate && (
									<ScheduledDate>
										<div>
											Order scheduled for:
											<div>{`${formatedScheduledDate}`}</div>
										</div>
									</ScheduledDate>
								)}
								{cartState?.order?.items.length > 0 ? (
									<>
										{cartState?.order?.items.map((cartItem: any) => (
											<React.Fragment key={cartItem?.id}>
												<CheckoutItem
													dispatchCart={dispatchCart}
													productName={cartItem?.name}
													productImage={cartItem?.imageUrl}
													productQuantity={cartItem?.quantity}
													productPrice={cartItem?.price}
													productModifierOptions={flatten(
														map(cartItem?.modifiers, "options")
													)}
													hideItemImageOnCheckOutPage={
														cartState?.showCheckoutPage
													}
												/>
												<StyledDivider />
											</React.Fragment>
										))}
										{/* @ts-ignore Catering will currently reuse Num. of Cutleries for Event Size (Num. of People) */}
										<>
											<Flex justify='space-between' py={12} align='center'>
												<CutleriesLabel>
													Event Size (Num. of People)
												</CutleriesLabel>
												<Flex align='center' justify='flex-end' columnGap={8}>
													<ActionIcon
														size='lg'
														radius='lg'
														variant='transparent'
														disabled={cartState?.order?.numberOfCutleries <= 6}
														onClick={() => {
															dispatchCart({
																type: cartActionTypes.SET_NUMBER_OF_CUTLERIES,
																numberOfCutleries:
																	cartState?.order?.numberOfCutleries - 1
															})
														}}
													>
														<IconCircleMinus
															size={36}
															color={
																cartState?.order?.numberOfCutleries <= 6
																	? "gray"
																	: "black"
															}
														/>
													</ActionIcon>
													<StyledNumberInput
														w={50}
														size='sm'
														precision={0}
														value={
															cartState?.order?.numberOfCutleries || undefined
														}
														onChange={(value: any) => {
															if (value >= 6) {
																dispatchCart({
																	type: cartActionTypes.SET_NUMBER_OF_CUTLERIES,
																	numberOfCutleries: parseInt(value)
																})
															}
														}}
													/>
													<ActionIcon
														size='lg'
														radius='lg'
														variant='transparent'
														onClick={() => {
															dispatchCart({
																type: cartActionTypes.SET_NUMBER_OF_CUTLERIES,
																numberOfCutleries:
																	cartState?.order?.numberOfCutleries + 1
															})
														}}
													>
														<IconCirclePlus size={36} color='black' />
													</ActionIcon>
												</Flex>
											</Flex>
											<StyledDivider />
										</>

										<Flex justify='space-between' align='center' mt={12}>
											<StyledButton
												variant={"transparent"}
												onClick={() => {
													setShowPromoCodeInput(true)
													dispatchCart({
														type: cartActionTypes.SET_VOUCHER_CODE,
														voucherCode: ""
													})
													dispatchCart({
														type: cartActionTypes.SET_SHOW_VOUCHER_NOT_FOUND_POPUP,
														showVoucherNotFoundPopup: false
													})
												}}
												style={{ padding: "0px", color: "#228be6" }}
											>
												Add Promo Code
											</StyledButton>
											{/* TODO: Add a loader here while fetching voucher details */}
											{voucher?.type && !showPromoCodeInput && (
												<VoucherAppliedContainer>
													<VoucherCodeText>
														{cartState?.voucherCode ?? "-"}
													</VoucherCodeText>
													<CloseButton
														onClick={() => {
															dispatchCart({
																type: cartActionTypes.SET_VOUCHER,
																voucher: null
															})
															dispatchCart({
																type: cartActionTypes.SET_VOUCHER_CODE,
																voucherCode: ""
															})
															dispatchCart({
																type: cartActionTypes.SET_ORDER_TIP,
																tip: 0
															})
															dispatchCart({
																type: cartActionTypes.SET_CALCULATED_ADDITIONAL_TIP,
																calculatedAddionalTip: 0
															})
															queryString([{ fieldName: "voucher", value: "" }])
															setShowPromoCodeInput(false)
														}}
													/>
												</VoucherAppliedContainer>
											)}
											{showPromoCodeInput && (
												<Flex align='center'>
													<StyledTextInput
														clearable
														style={{ width: "6rem" }}
														value={cartState?.voucherCode}
														onChange={(event: any) => {
															dispatchCart({
																type: cartActionTypes.SET_VOUCHER_CODE,
																voucherCode: event.target.value
															})
															dispatchCart({
																type: cartActionTypes.SET_CALCULATED_ADDITIONAL_TIP,
																calculatedAddionalTip: parseFloat(calculatedTip)
															})
														}}
														rightSection={
															<CloseButton
																aria-label='Clear input'
																onClick={() => {
																	dispatchCart({
																		type: cartActionTypes.SET_VOUCHER,
																		voucher: null
																	})
																	dispatchCart({
																		type: cartActionTypes.SET_VOUCHER_CODE,
																		voucherCode: ""
																	})
																	dispatchCart({
																		type: cartActionTypes.SET_ORDER_TIP,
																		tip: 0
																	})
																	dispatchCart({
																		type: cartActionTypes.SET_CALCULATED_ADDITIONAL_TIP,
																		calculatedAddionalTip: 0
																	})

																	setShowPromoCodeInput(false)
																}}
																style={{
																	display: cartState?.voucherCode
																		? undefined
																		: "none"
																}}
															/>
														}
													/>
													<StyledButton
														style={{ marginLeft: "4px" }}
														onClick={() => {
															fetchVoucher({
																voucherCode: cartState?.voucherCode,
																hotelId: cartState?.currentHotel?.id,
																isLoading: voucherLoading
															})
															setShowPromoCodeInput(false)
														}}
													>
														<IconCheck stroke={2} size={16} />
													</StyledButton>
												</Flex>
											)}
										</Flex>

										{voucher && (
											<VoucherInfoContainer>
												<VoucherInfoContainerDetails>
													<div>Initial Balance:</div>
													<div>
														{showPrice(
															voucher?.total_amount - voucher?.amount_used
														)}
													</div>
												</VoucherInfoContainerDetails>
											</VoucherInfoContainer>
										)}

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
														Tax{" "}
														{`(${parseFloat(cartState?.taxRate || 0)?.toFixed(
															3
														)}%)`}
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
										{voucher && (
											<VoucherInfoContainer>
												<VoucherInfoContainerDetails>
													<div>Remaining Balance:</div>
													<div>
														{showPrice(
															voucher?.total_amount -
																voucher?.amount_used -
																parseFloat(totalDifference)
														)}
													</div>
												</VoucherInfoContainerDetails>
											</VoucherInfoContainer>
										)}
									</>
								) : (
									<EmptyCartContainer>
										<Image
											src='./empty-cart.svg'
											alt='Empty cart'
											width={250}
										/>
										<EmptyCartLabel>
											<div>Your cart is empty</div>
											<div>Add items to get started</div>
										</EmptyCartLabel>
									</EmptyCartContainer>
								)}
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item value='account-information'>
							<Accordion.Control>Account Information</Accordion.Control>
							<Accordion.Panel sx={{ backgroundColor: "white" }}>
								<CheckoutGuestForm
									cartState={cartState}
									totalPrice={totalPrice}
									dispatchCart={dispatchCart}
									form={form}
									setScheduleOrderModalOpen={setScheduleOrderModalOpen}
								/>
							</Accordion.Panel>
						</Accordion.Item>
						{cartState?.order.orderType === PAYMENT_METHOD.CREDIT_CARD.value ? (
							<Accordion.Item value='payment-information'>
								<Accordion.Control>Payment Information</Accordion.Control>
								<Accordion.Panel sx={{ backgroundColor: "white" }}>
									<Elements stripe={stripePromise} options={stripeOptions}>
										<StripePaymentsElement
											cartState={cartState}
											setPaymentEnabled={setPaymentEnabled}
											setPaymentInProgress={setPaymentInProgress}
											paymentRef={paymentElementRef}
											dispatchCart={dispatchCart}
											openOrderDetailsAccordion={openOrderDetailsAccordion}
											cancelOrder={cancelOrder}
										/>
									</Elements>
								</Accordion.Panel>
							</Accordion.Item>
						) : null}
					</Accordion>
					<Flex>
						<StyledButton
							fullWidth={true}
							mt={24}
							mb={24}
							size='md'
							radius={8}
							color='indigo.9'
							loading={
								createOrderIsLoading ||
								paymentInitIsLoading ||
								paymentInProgress
							}
							disabled={
								!form.isValid() ||
								createOrderIsLoading ||
								paymentInitIsLoading ||
								paymentInProgress ||
								!paymentEnabled
							}
							onClick={() => {
								let formatedScheduledDate = undefined

								if (cartState.order?.scheduledDate) {
									formatedScheduledDate = formatInTimeZone(
										cartState.order?.scheduledDate,
										cartState?.currentHotel?.timezone,
										"yyyy-MM-dd HH:mm:ss.SSS XX"
									)
								}

								if (
									!validateScheduleOrderTime(
										cartState.order?.scheduledDate,
										true
									)
								) {
									customNotification.error({
										title: "Schedule Order Failed",
										message: `Your scheduled order time is too soon. Please reschedule to a time at least 48 hour from now.`
									})
									setScheduleOrderModalOpen(true)
									return
								}
								createOrder({
									tip: "0",
									comment: cartState?.order?.comment,
									hotelId: cartState.currentHotel?.id,
									mealPeriodId: cartState.mealPeriodId,
									orderType: cartState.order.orderType,
									clientName: cartState.order.clientName,
									roomNumber: cartState.order.roomNumber,
									clientEmail: cartState.order.clientEmail,
									clientNumber: `${cartState?.order?.clientNumber}`,
									voucherCodeId: cartState?.order?.voucher?.id,
									numberOfCutleries: cartState?.order?.numberOfCutleries,
									scheduledDate: formatedScheduledDate,
									items: cartState.order.items?.map((item: any) => {
										const { id, quantity } = item
										const modifierData = item?.modifiers?.map(
											(modifier: any) => {
												const { id, options } = modifier
												const optionsData = options.map((option: any) => ({
													id: option.id,
													quantity: option.quantity
												}))
												return { id, options: optionsData }
											}
										)
										return { id, quantity, modifiers: modifierData }
									}),
									hasAlcohol: cartState.order.hasAlcohol,
									isCatering: true,
									merchantId: 0,
									rideGrandTotal: 0
								})
							}}
						>
							Place Order
						</StyledButton>
					</Flex>
					<Flex>
						<ConsentText>
							I consent to the collection and use of my personal data for the
							specified purposes outlined in the Alfred Privacy Policy.
						</ConsentText>
					</Flex>
				</Grid.Col>
			</Grid>
		</CheckoutContainer>
	)
}

export default Checkout
