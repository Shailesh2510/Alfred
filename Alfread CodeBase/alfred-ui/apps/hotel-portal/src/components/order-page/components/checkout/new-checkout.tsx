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
import { useRouter } from "next/router"
import usePaymentInit from "@/hooks/payment/usePaymentInit"
import useCreateOrder from "@/hooks/order/useCreateOrder"
import { EMAIL_VALIDATION_REGEX, PAYMENT_METHOD } from "@/shared-constants"
import { useForm } from "@mantine/form"
import StripePaymentsElement from "../stripe-payment-element"
import useMenu from "@/hooks/menu/useMenu"
import useQueryString from "@/custom-hooks/useQueryString"
import validateCartItems from "@/components/shared/utils/validateCartItems"
import useVoucher from "@/hooks/voucher/useVoucher"
import useGlobalStore from "@/globalStore/globalStore"
import useCartStore from "../../stores/useCartStore"
import { calculateDeliveryFee } from "../../utils/calculateDeliveryFee"
import useCancelOrder from "@/hooks/order/useCancelOrder"
import useRefundVoucher from "@/hooks/voucher/useRefundVoucher"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string)

interface MealPeriod {
	startHour: string
	endHour: string
	mealPeriodId: number
}
const NewCheckout = () => {
	const router = useRouter()
	const queryString = useQueryString()

	const [openAccordions, setOpenAccordions] = useState([
		"order-details",
		"account-information",
		"payment-information"
	])

	const { currentHotelDetails, setShowCheckoutPage } = useGlobalStore()
	const {
		setOrderTip,
		setVoucher,
		setVoucherCode,
		resetOrder,
		setOrderId,
		setCalculatedAdditionalTip,
		setNumberOfCutleries,
		setOrderType,
		mealPeriodId,
		setShowScheduleModal,
		order,
		taxRate,
		selectedMerchantCoordinates,
		shipdayDeliveryFee,
		voucherCode,
		merchantDetails,
		setOpenPaymentFailedModal
	} = useCartStore()

	const [showPromoCodeInput, setShowPromoCodeInput] = useState(false)
	const [paymentEnabled, setPaymentEnabled] = useState(false)
	const [paymentInProgress, setPaymentInProgress] = useState(false)
	const allowRoomCharge = currentHotelDetails?.allowRoomCharge ?? false
	const allowCreditCard = currentHotelDetails?.allowCreditCard ?? false
	const paymentElementRef = useRef<any>(null)

	const { mutate: fetchVoucher } = useVoucher({
		onSuccess: (data: any) => {
			if (Object.keys(data).length !== 0) {
				setOrderTip(0)
				setVoucher(data)
			} else {
				customNotification.error({
					title: "Failure",
					message: "Voucher not found!"
				})
				setVoucher(null)
				setVoucherCode("")
			}
		}
	})

	const { mutate: refundVoucher } = useRefundVoucher()

	const { data: menuData } = useMenu({
		hotelId: currentHotelDetails?._id
	})

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}, [])

	const validateCartItemAvailability = async () => {
		if (!menuData) {
			return false
		}

		const mealPeriodIds =
			order?.items?.map(
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
			currentHotelDetails?.timezone
		)
	}
	const voucher = order?.voucher

	const hasDeliveryFee = areSimilarCoordinates(
		currentHotelDetails?.coordinates,
		selectedMerchantCoordinates
	)
		? false
		: currentHotelDetails?.hasDeliveryFee

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
		tip: order?.tip,
		items: order?.items,
		taxRate: taxRate,
		isTaxExempt: currentHotelDetails?.isTaxExempt,
		deliveryFee: calculateDeliveryFee(
			hasDeliveryFee,
			merchantDetails?.has_third_party_delivery,
			shipdayDeliveryFee,
			currentHotelDetails?.deliveryFee
		),
		hasDeliveryFee: hasDeliveryFee,
		isMandatoryTipEnabled: currentHotelDetails?.enableAutomaticTip,
		isDeliveryInSamePlace: areSimilarCoordinates(
			currentHotelDetails?.coordinates,
			selectedMerchantCoordinates
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
			tip: order?.tip || "",
			clientName: order?.clientName || "",
			clientNumber: order?.clientNumber || "",
			clientEmail: order?.clientEmail || "",
			orderType: order?.orderType || "",
			roomNumber: order?.roomNumber || "",
			comment: order?.comment || ""
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
		if (currentHotelDetails?.allowCreditCard) {
			form.setFieldValue("orderType", PAYMENT_METHOD.CREDIT_CARD.value)
			setOrderType(PAYMENT_METHOD.CREDIT_CARD.value)
		} else if (currentHotelDetails?.allowRoomCharge) {
			form.setFieldValue("orderType", PAYMENT_METHOD.ROOM_CHARGE.value)
			setOrderType(PAYMENT_METHOD.ROOM_CHARGE.value)
		}
	}, [currentHotelDetails])

	const { mutate: paymentInit, isLoading: paymentInitIsLoading } =
		usePaymentInit({
			onSuccess: (result: any) => {
				if (result?.data?.[0]?.clientSecret) {
					paymentElementRef.current?.submit(result?.data?.[0]?.clientSecret)
				} else {
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

	const { mutate: cancelOrder } = useCancelOrder({
		onSuccess: () => {
			openOrderDetailsAccordion()
			if (voucherCode) {
				refundVoucher(order?.orderId?.toString())
			}
			setPaymentInProgress(false)

			setOpenPaymentFailedModal(true)
			customNotification.error({
				title: "Payment failed",
				message: "The payment has failed, Please try again!"
			})
			router.back()
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
					setOrderId(response?.nonce, response?.id)
					if (response?.order_type === PAYMENT_METHOD.CREDIT_CARD.value) {
						paymentInit({
							orderId: response?.nonce,
							amount: parseFloat(totalPrice) * 100,
							paymentMethodType: "card",
							clientName: order?.clientName,
							clientNumber: `${order?.clientNumber}`,
							clientEmail: order?.clientEmail
						})
					} else {
						router.push(`/order/${response?.nonce}?orderStatus=success`)
						resetOrder()
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

	const paymentOptions = [
		{
			label: PAYMENT_METHOD.CREDIT_CARD.label,
			value: PAYMENT_METHOD.CREDIT_CARD.value,
			disabled: !allowCreditCard
		},
		...(allowRoomCharge &&
		areSimilarCoordinates(
			currentHotelDetails?.coordinates,
			selectedMerchantCoordinates
		)
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
								setShowCheckoutPage(false)
								router.back()
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
								{order?.scheduledDate && (
									<ScheduledDate>
										Order scheduled for:
										<div>{`${order?.scheduledDate}`}</div>
									</ScheduledDate>
								)}
								{order?.items.length > 0 ? (
									<>
										{order?.items.map((cartItem: any) => (
											<React.Fragment key={cartItem?.id}>
												<CheckoutItem
													productName={cartItem?.name}
													productImage={cartItem?.imageUrl}
													productQuantity={cartItem?.quantity}
													productPrice={cartItem?.price}
													productModifierOptions={flatten(
														map(cartItem?.modifiers, "options")
													)}
													hideItemImageOnCheckOutPage={router.asPath.includes(
														"checkout"
													)}
												/>
												<StyledDivider />
											</React.Fragment>
										))}
										{currentHotelDetails?.hasCutlery && (
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
															disabled={order?.numberOfCutleries <= 1}
															onClick={() => {
																setNumberOfCutleries(
																	order?.numberOfCutleries - 1
																)
															}}
														>
															<IconCircleMinus
																size={36}
																color={
																	order?.numberOfCutleries <= 1
																		? "gray"
																		: "black"
																}
															/>
														</ActionIcon>
														<StyledNumberInput
															w={50}
															size='sm'
															precision={0}
															value={order?.numberOfCutleries || undefined}
															onChange={(value: any) => {
																if (value > 0) {
																	setNumberOfCutleries(parseInt(value))
																}
															}}
														/>
														<ActionIcon
															size='lg'
															radius='lg'
															variant='transparent'
															onClick={() => {
																setNumberOfCutleries(
																	order?.numberOfCutleries + 1
																)
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
													setVoucherCode("")
												}}
												style={{ padding: "0px", color: "#228be6" }}
											>
												Add Promo Code
											</StyledButton>
											{/* TODO: Add a loader here while fetching voucher details */}
											{voucher?.type && !showPromoCodeInput && (
												<VoucherAppliedContainer>
													<VoucherCodeText>
														{voucherCode ?? "-"}
													</VoucherCodeText>
													<CloseButton
														onClick={() => {
															setVoucher(null)
															setVoucherCode("")
															setOrderTip(0)
															setCalculatedAdditionalTip(0)
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
														value={voucherCode}
														onChange={(event: any) => {
															setVoucherCode(event.target.value)
															setCalculatedAdditionalTip(
																parseFloat(calculatedTip)
															)
														}}
														rightSection={
															<CloseButton
																aria-label='Clear input'
																onClick={() => {
																	setVoucher(null)
																	setVoucherCode("")
																	setOrderTip(0)
																	setCalculatedAdditionalTip(0)

																	setShowPromoCodeInput(false)
																}}
																style={{
																	display: voucherCode ? undefined : "none"
																}}
															/>
														}
													/>
													<StyledButton
														style={{ marginLeft: "4px" }}
														onClick={() => {
															fetchVoucher({
																voucherCode: voucherCode,
																hotelId: currentHotelDetails?._id
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
											{!currentHotelDetails?.isTaxExempt && (
												<CartTaxAmount>
													<div>
														Tax {`(${parseFloat(taxRate || "0")?.toFixed(3)}%)`}
													</div>
													<div>{showPrice(taxAmount)}</div>
												</CartTaxAmount>
											)}
											{order?.tip ? (
												<CartTip>
													<div>Tip</div>
													<div>{showPrice(order?.tip)}</div>
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
										<Image src='/empty-cart.svg' alt='Empty cart' width={250} />
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
									totalPrice={totalPrice}
									form={form}
									// setScheduleOrderModalOpen={setScheduleOrderModalOpen}
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
											setOrderType(value)
											if (value === PAYMENT_METHOD.ROOM_CHARGE.value) {
												setPaymentEnabled(true)
											}
										}}
									/>
									{order.orderType === PAYMENT_METHOD.CREDIT_CARD.value ? (
										<Elements stripe={stripePromise} options={stripeOptions}>
											<StripePaymentsElement
												setPaymentEnabled={setPaymentEnabled}
												setPaymentInProgress={setPaymentInProgress}
												paymentRef={paymentElementRef}
												openOrderDetailsAccordion={openOrderDetailsAccordion}
												cancelOrder={cancelOrder}
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
								if (!order?.scheduledDate) {
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

								let formatedScheduledDate = null

								if (order?.scheduledDate) {
									formatedScheduledDate = formatScheduledOrderDateTime(
										order?.scheduledDate,
										currentHotelDetails?.timezone
									)
								}

								if (!validateScheduleOrderTime(order?.scheduledDate, false)) {
									customNotification.error({
										title: "Schedule Order Failed",
										message: `Your scheduled order time is too soon. 
                Please reschedule to a time at least 1 hour from now.`
									})
									setShowScheduleModal(true)
									return
								}
								createOrder({
									tip:
										parseFloat(calculatedTip) > 0
											? calculatedTip.toString()
											: order?.tip?.toString(),
									comment: order?.comment,
									hotelId: currentHotelDetails?._id,
									mealPeriodId: mealPeriodId ? parseInt(mealPeriodId) : 0,
									orderType: order.orderType,
									clientName: order.clientName,
									roomNumber: order.roomNumber,
									clientEmail: order.clientEmail,
									clientNumber: `${order?.clientNumber}`,
									voucherCodeId: order?.voucher?.id,
									numberOfCutleries: order?.numberOfCutleries.toString(),
									scheduledDate: formatedScheduledDate,
									items: order.items?.map((item: any) => {
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
									hasAlcohol: order.hasAlcohol,
									isCatering: false,
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

export default NewCheckout
