import {
	Accordion,
	ActionIcon,
	CloseButton,
	Flex,
	Grid,
	Image,
	SegmentedControl
} from "@mantine/core"
import {
	StyledButton,
	StyledDivider,
	StyledNumberInput,
	StyledTextInput
} from "@/design-components"
import CheckoutItem from "../checkout-item"
import {
	areSimilarCoordinates,
	customNotification,
	formatScheduledOrderDateTime,
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
	VoucherAppliedContainer
} from "./checkout.style"
import { StripeElementsOptionsMode, loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import React, { useEffect, useRef, useState } from "react"
import { ScheduledDate } from "../../order-page.style"
import {
	IconArrowLeft,
	IconCheck,
	IconCircleMinus,
	IconCirclePlus
} from "@tabler/icons-react"
import { cartActionTypes } from "../../reducers/cartReducerts"
import { useRouter } from "next/router"
import usePaymentInit from "@/hooks/payment/usePaymentInit"
import useCreateOrder from "@/hooks/order/useCreateOrder"
import { EMAIL_VALIDATION_REGEX, PAYMENT_METHOD } from "@/shared-constants"
import useCreateReferralRecord from "@/hooks/referral/useCreateReferralRecord"
import { useForm } from "@mantine/form"
import StripePaymentsElement from "../stripe-payment-element"
import useMenu from "@/hooks/menu/useMenu"
import useQueryString from "@/custom-hooks/useQueryString"
import validateCartItems from "@/components/shared/utils/validateCartItems"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string)

interface MealPeriod {
	startHour: string
	endHour: string
	mealPeriodId: number
}
const Checkout = ({
	cartState,
	dispatchCart,
	setScheduleOrderModalOpen,
	fetchVoucher
}: any) => {
	const router = useRouter()
	const { campaign_uid, short_code } = router.query
	const queryString = useQueryString()

	const [openAccordions, setOpenAccordions] = useState([
		"order-details",
		"account-information",
		"payment-information"
	])
	const [showPromoCodeInput, setShowPromoCodeInput] = useState(false)
	const [paymentEnabled, setPaymentEnabled] = useState(false)
	const [paymentInProgress, setPaymentInProgress] = useState(false)
	const { allowRoomCharge, allowCreditCard } = cartState.currentHotel
	const paymentElementRef = useRef<any>(null)

	const { data: menuData } = useMenu({
		hotelId: cartState?.currentHotel?.id
	})

	const validateCartItemAvailability = async () => {
		if (!menuData) {
			return false
		}

		const mealPeriodIds =
			cartState?.order?.items?.map(
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
			cartState?.currentHotel?.timezone
		)
	}
	const voucher = cartState?.order?.voucher

	const hasDeliveryFee = areSimilarCoordinates(
		cartState?.currentHotel?.coordinates,
		cartState?.selectedMerchantCoordinates
	)
		? false
		: cartState?.currentHotel?.hasDeliveryFee

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
		tip: cartState?.order?.tip,
		items: cartState?.order?.items,
		taxRate: cartState?.taxRate,
		isTaxExempt: cartState?.currentHotel?.isTaxExempt,
		deliveryFee:
			cartState?.shipdayDeliveryFee > 0
				? cartState?.shipdayDeliveryFee
				: cartState?.currentHotel?.deliveryFee,
		hasDeliveryFee: hasDeliveryFee,
		isMandatoryTipEnabled: cartState?.currentHotel?.enableAutomaticTip,
		isDeliveryInSamePlace: areSimilarCoordinates(
			cartState?.currentHotel?.coordinates,
			cartState?.selectedMerchantCoordinates
		)
	})

	const stripeOptions: StripeElementsOptionsMode = {
		mode: "payment",
		amount: Math.round(parseFloat(totalPrice) * 100),
		currency: "usd",
		clientSecret: undefined,
		payment_method_types: ["card"]
	}

	useEffect(() => {
		if (parseFloat(totalPrice) === 0) {
			setPaymentEnabled(true)
		}
	}, [totalPrice])

	const form = useForm({
		validateInputOnChange: true,
		initialValues: {
			tip: cartState?.order?.tip || "",
			clientName: cartState?.order?.clientName || "",
			clientNumber: cartState?.order?.clientNumber || "",
			clientEmail: cartState?.order?.clientEmail || "",
			orderType: cartState?.order?.orderType || "",
			roomNumber: cartState?.order?.roomNumber || "",
			comment: cartState?.order?.comment || ""
		},
		validate: {
			clientName: (value: string) =>
				value?.length < 2 ? "Please enter a valid name" : null,
			clientEmail: (value: string) =>
				EMAIL_VALIDATION_REGEX.test(value)
					? null
					: "Please enter a valid email",
			roomNumber: (value: string) =>
				value?.length < 1 ? "Please enter a valid room number" : null,
			clientNumber: (value: string) => validateCountryPhoneNumber(value),
			orderType: (value: string) =>
				value === PAYMENT_METHOD.ROOM_CHARGE.value ||
				value === PAYMENT_METHOD.CREDIT_CARD.value
					? null
					: "Please enter a valid payment method"
		}
	})

	useEffect(() => {
		if (cartState.currentHotel.allowCreditCard) {
			form.setFieldValue("orderType", PAYMENT_METHOD.CREDIT_CARD.value)
			dispatchCart({
				type: cartActionTypes.SET_ORDER_TYPE,
				orderType: PAYMENT_METHOD.CREDIT_CARD.value
			})
		} else if (cartState.currentHotel.allowRoomCharge) {
			form.setFieldValue("orderType", PAYMENT_METHOD.ROOM_CHARGE.value)
			dispatchCart({
				type: cartActionTypes.SET_ORDER_TYPE,
				orderType: PAYMENT_METHOD.ROOM_CHARGE.value
			})
		}
	}, [cartState.currentHotel])

	const { mutate: paymentInit, isLoading: paymentInitIsLoading } =
		usePaymentInit({
			onSuccess: (result: any) => {
				if (result?.data?.[0]?.clientSecret) {
					paymentElementRef.current?.submit(result?.data?.[0]?.clientSecret)
				} else {
					if (campaign_uid && short_code) {
						createReferralRecord({
							amount: totalPrice,
							orderId: result?.data?.[0]?.orderId,
							clientName: cartState?.order?.clientName,
							clientEmail: cartState?.order?.clientEmail,
							campaignUid: campaign_uid,
							shortCode: short_code
						})
					}
					router.push(
						`/order/${result?.data?.[0]?.orderId}?orderStatus=success`
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
							clientEmail: cartState?.order?.clientEmail
						})
					} else {
						if (campaign_uid && short_code) {
							createReferralRecord({
								amount: totalPrice,
								orderId: response?.nonce,
								clientName: cartState?.order?.clientName,
								clientEmail: cartState?.order?.clientEmail,
								campaignUid: campaign_uid,
								shortCode: short_code
							})
						}
						router.push(`/order/${response?.nonce}?orderStatus=success`)
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

	const paymentOptions = [
		{
			label: PAYMENT_METHOD.CREDIT_CARD.label,
			value: PAYMENT_METHOD.CREDIT_CARD.value,
			disabled: !allowCreditCard
		},
		...(allowRoomCharge
			? [
					{
						label: PAYMENT_METHOD.ROOM_CHARGE.label,
						value: PAYMENT_METHOD.ROOM_CHARGE.value,
						disabled: !allowRoomCharge
					}
			  ]
			: [])
	]

	const openOrderDetailsAccordion = () => {
		setOpenAccordions(["order-details"])
	}

	return (
		<CheckoutContainer>
			<Grid gutter={24} justify='center' align='center'>
				<Grid.Col xs={12} sm={8} md={6} lg={4} xl={3}>
					<Flex align='flex-start' mb={12} justify='space-between'>
						<ActionIcon
							onClick={() => {
								dispatchCart({
									type: cartActionTypes.SET_SHOW_CHECKOUT_PAGE,
									showCheckoutPage: false
								})
								router.push({
									pathname: `/${cartState.currentHotel.webCode}`
								})
							}}
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
								{cartState.order?.scheduledDate && (
									<ScheduledDate>
										Order scheduled for:
										<div>{`${cartState.order?.scheduledDate}`}</div>
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
										{cartState?.currentHotel?.hasCutlery && (
											<>
												<Flex justify='space-between' py={12} align='center'>
													<CutleriesLabel>
														Num. of cutleries & napkins
													</CutleriesLabel>
													<Flex align='center' justify='flex-end' columnGap={8}>
														<ActionIcon
															size='lg'
															radius='lg'
															variant='transparent'
															disabled={
																cartState?.order?.numberOfCutleries <= 1
															}
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
																	cartState?.order?.numberOfCutleries <= 1
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
																if (value > 0) {
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
										)}
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
																hotelId: cartState?.currentHotel?.id
															})
															setShowPromoCodeInput(false)
														}}
													>
														<IconCheck stroke={2} size={16} />
													</StyledButton>
												</Flex>
											)}
										</Flex>
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
						{parseFloat(totalPrice) > 0.5 ? (
							<Accordion.Item value='payment-information'>
								<Accordion.Control>Payment Information</Accordion.Control>
								<Accordion.Panel sx={{ backgroundColor: "white" }}>
									<SegmentedControl
										radius={4}
										fullWidth
										mt={12}
										mb={12}
										data={paymentOptions}
										{...form.getInputProps("orderType")}
										onChange={value => {
											form.setFieldValue("orderType", value)
											dispatchCart({
												type: cartActionTypes.SET_ORDER_TYPE,
												orderType: value
											})
											if (value === PAYMENT_METHOD.ROOM_CHARGE.value) {
												setPaymentEnabled(true)
											}
										}}
									/>
									{cartState?.order.orderType ===
									PAYMENT_METHOD.CREDIT_CARD.value ? (
										<Elements stripe={stripePromise} options={stripeOptions}>
											<StripePaymentsElement
												cartState={cartState}
												setPaymentEnabled={setPaymentEnabled}
												setPaymentInProgress={setPaymentInProgress}
												paymentRef={paymentElementRef}
												dispatchCart={dispatchCart}
												openOrderDetailsAccordion={openOrderDetailsAccordion}
											/>
										</Elements>
									) : null}
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
							onClick={async () => {
								if (!cartState.order?.scheduledDate) {
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

								let formatedScheduledDate = undefined

								if (cartState.order?.scheduledDate) {
									formatedScheduledDate = formatScheduledOrderDateTime(
										cartState.order?.scheduledDate,
										cartState?.currentHotel?.timezone
									)
								}

								if (
									!validateScheduleOrderTime(cartState.order?.scheduledDate)
								) {
									customNotification.error({
										title: "Schedule Order Failed",
										message: `Your scheduled order time is too soon. 
                Please reschedule to a time at least 1 hour from now.`
									})
									setScheduleOrderModalOpen(true)
									return
								}
								createOrder({
									tip:
										parseFloat(calculatedTip) > 0
											? calculatedTip.toString()
											: cartState?.order?.tip?.toString(),
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
									isCatering: false
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
