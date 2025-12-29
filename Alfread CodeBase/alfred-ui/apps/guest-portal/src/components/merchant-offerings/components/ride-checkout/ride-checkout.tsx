import React, { useEffect, useRef, useState } from "react"
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
	StyledCountryPhoneNumber,
	StyledDivider,
	StyledTextInput
} from "@/design-components"
import { useRouter } from "next/router"
import useGlobalStore from "@/globalStore/globalStore"
import {
	customNotification,
	showPrice,
	validateCountryPhoneNumber,
	validateScheduleRideTime
} from "@/shared-utils"
import { EMAIL_VALIDATION_REGEX, PAYMENT_METHOD } from "@/shared-constants"
import usePaymentInit from "@/hooks/payment/usePaymentInit"
import useCreateOrder from "@/hooks/order/useCreateOrder"
import useCreateReferralRecord from "@/hooks/referral/useCreateReferralRecord"
import { IconArrowLeft, IconCheck } from "@tabler/icons-react"
import { ScheduledDate } from "@/components/order-page/order-page.style"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe, StripeElementsOptionsMode } from "@stripe/stripe-js"
import calculateRideTotalPrice from "@/components/order-page/utils/calculateRideTotalPrice"
import StripePaymentsElement from "@/components/order-page/components/stripe-payment-element"
import { toNumber } from "lodash"
import {
	ConsentText,
	RefundPolicyText
} from "@/components/order-page/components/checkout/checkout.style"
import { useForm } from "@mantine/form"
import useRideStore from "@/components/merchant-offerings/store/useRideStore"
import {
	EmptyRideCartContainer,
	EmptyRideCartLabel,
	RideCartPriceContainer,
	RideCartSubtotalPrice,
	RideCartTotalPrice,
	RideCheckoutContainer,
	RideDetailsText,
	RideDiscountAmount,
	ServiceFee,
	AmbassadorCodeContainer,
	AmbassadorCodeInput,
	AmbassadorName,
	AmbassadorSuccessContainer
} from "./ride-checkout.style"
import {
	CheckoutCartName,
	CheckoutItemContainer,
	ProductDetails,
	ProductPrice
} from "@/components/order-page/components/checkout-item/checkout-item.style"
import { format } from "date-fns"
import RideSubHeader from "../ride-list/components/RideSubHeader"
import useCarmelRideList from "@/hooks/rides/useCarmelRideList"
import { convertTo24Hour } from "@/shared-utils"
import useCreateTrip from "@/hooks/rides/useCreateTrip"
import { useMediaQuery } from "@mantine/hooks"
import useCancelOrder from "@/hooks/order/useCancelOrder"
import useCartStore from "@/components/order-page/stores/useCartStore"
import useAmbassadorCode from "@/hooks/ambassador/useAmbassadorCode"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY as string)
const RideCheckout = () => {
	const router = useRouter()
	const { campaign_uid, short_code, hotelId, merchantId } = router.query
	const isSmallScreen = useMediaQuery("(max-width: 1200px)")

	const [showAmbassadorInput, setShowAmbassadorInput] = useState(false)
	const [ambassadorCode, setAmbassadorCode] = useState("")
	const [ambassadorDetails, setAmbassadorDetails] = useState<any>(null)

	const [openAccordions, setOpenAccordions] = useState([
		"order-details",
		"account-information",
		"payment-information"
	])

	const [paymentEnabled, setPaymentEnabled] = useState(false)
	const [paymentInProgress, setPaymentInProgress] = useState(false)
	const paymentElementRef = useRef<any>(null)

	const { currentHotelDetails } = useGlobalStore()

	const { setOpenPaymentFailedModal } = useCartStore()

	const {
		ride,
		setRideClientNumber,
		setRideClientFirstName,
		setRideClientLastName,
		setRideClientEmail,
		carmelMealPeriodId,
		carmelMerchantId,
		rideForm,
		setRideNonce,
		setRideOptions,
		addRide,
		rideOptions,
		refetchRideList,
		setRefetchRideList,
		setOpenChangeRideForm,
		rideNonce,
		pickUpAddress,
		dropOffAddress,
		setRideFormValue
	} = useRideStore()

	// const { mutate: fetchVoucher } = useVoucher({
	// 	onSuccess: (data: any) => {
	// 		if (Object.keys(data).length !== 0) {
	// 			setRideVoucher(data)
	// 		} else {
	// 			customNotification.error({
	// 				title: "Failure",
	// 				message: "Voucher not found!"
	// 			})
	// 			setRideVoucher(null)
	// 			setRideVoucherCode("")
	// 		}
	// 	}
	// })

	// const voucher = ride?.voucher

	const { totalPrice, totalDifference } = calculateRideTotalPrice({
		voucher: null,
		items: ride?.items
	})

	const stripeOptions: StripeElementsOptionsMode = {
		mode: "payment",
		amount: Math.round(parseFloat(totalPrice) * 100),
		currency: "usd",
		clientSecret: undefined,
		payment_method_types: ["card"]
	}

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}, [])

	useEffect(() => {
		if (parseFloat(totalPrice) === 0) {
			setPaymentEnabled(true)
		}
	}, [totalPrice])

	const { mutate: fetchPriceListFromCarmel } = useCarmelRideList({
		onSuccess: (result: any) => {
			if (result.fetchRidesSuccessful) {
				setRideOptions(result?.rideOptions)
				if (ride?.items !== null) {
					const selectedRide = result?.rideOptions.filter(
						(rideOption: any) =>
							rideOption.carClassDesc.toLowerCase().trim() ===
							ride?.items?.name.toLowerCase().trim()
					)
					addRide({
						id: selectedRide[0]?.fare?.fareId,
						name: selectedRide[0]?.carClassDesc,
						cartItemId: selectedRide[0]?.fare?.fareId,
						cartItemTime: new Date(),
						imageUrl: `/carmel-cars/${selectedRide[0]?.carClassID}.png`,
						baseFare: selectedRide[0]?.fare?.fare,
						serviceFee:
							selectedRide[0]?.fare?.total - selectedRide[0]?.fare?.fare,
						price: selectedRide[0]?.fare?.total
					})
				}
				customNotification.success({
					message: "Prices are refreshed"
				})
			}
		},

		onError: () => {
			customNotification.error({
				title: "Failed",
				message: "Unable to find any rides"
			})
			router.push(`/${hotelId}`)
		}
	})

	const { mutate: createCarmelTrip } = useCreateTrip({
		onSuccess: (result: any) => {
			if (result?.isCarmelTripCreated) {
				paymentInit({
					orderId: rideNonce,
					amount: parseFloat(totalPrice) * 100,
					paymentMethodType: "card",
					clientName: ride.clientFirstName + " " + ride.clientLastName,
					clientNumber: `${ride?.clientNumber}`,
					clientEmail: ride?.clientEmail,
					isRideService: true
				})
				setPaymentInProgress(true)
			} else {
				customNotification.error({
					title: "Failed",
					message: "Unable to book rides right now. Please try again later!"
				})
				router.push(`/${hotelId}`)
			}
		},
		onError: () => {
			customNotification.error({
				title: "Failed",
				message: "Unable to book rides right now. Please try again later!"
			})
			router.push(`/${hotelId}`)
		}
	})

	useEffect(() => {
		if (refetchRideList) {
			const priceListPayload = {
				addressFrom: pickUpAddress,
				addressTo: dropOffAddress,
				tripDate:
					rideForm.travelDate && format(rideForm.travelDate, "MM/dd/yyyy"),
				tripTime: convertTo24Hour(rideForm.travelTime)
			}
			fetchPriceListFromCarmel({ hotelId: hotelId, rideList: priceListPayload })
			setRefetchRideList(false)
		}
	}, [refetchRideList])

	const form = useForm({
		validateInputOnChange: true,
		initialValues: {
			clientFirstName: ride?.clientFirstName || "",
			clientLastName: ride?.clientLastName || "",
			clientNumber: ride?.clientNumber || "",
			clientEmail: ride?.clientEmail || ""
		},
		validate: {
			clientFirstName: (value: string) =>
				value?.length < 2 ? "Please enter a valid first name" : null,
			clientLastName: (value: string) =>
				value?.length < 2 ? "Please enter a valid last name" : null,
			clientEmail: (value: string) =>
				EMAIL_VALIDATION_REGEX.test(value)
					? null
					: "Please enter a valid email",

			clientNumber: (value: string) => validateCountryPhoneNumber(value)
		}
	})

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
							clientName: ride.clientFirstName + " " + ride.clientLastName,
							clientEmail: ride?.clientEmail,
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

	const { mutate: cancelOrder } = useCancelOrder({
		onSuccess: () => {
			openOrderDetailsAccordion()
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

	const createTripUpdatePayload = (response: any) => {
		const firstSpaceIndex = ride?.clientNumber.indexOf(" ")
		const countryCode = ride?.clientNumber
			.slice(0, firstSpaceIndex)
			.replace("+", "")
		const number = ride?.clientNumber
			.slice(firstSpaceIndex + 1)
			.replace(/[\s()-]/g, "")
		return {
			nonce: response?.nonce,
			addressFrom: pickUpAddress,
			addressTo: dropOffAddress,
			tripDate:
				rideForm?.travelDate && format(rideForm?.travelDate, "MM/dd/yyyy"),
			tripTime: convertTo24Hour(rideForm?.travelTime),
			customerFirstName: ride?.clientFirstName,
			customerLastName: ride?.clientLastName,
			customerPhone: {
				countryCode: countryCode,
				number: number
			},
			emailAddr: ride?.clientEmail,
			carClassID: ride?.items?.carClassId,
			fareId: ride?.items?.id
		}
	}
	const { mutate: createOrder, isLoading: createOrderIsLoading } =
		useCreateOrder({
			onSuccess: async (response: any) => {
				if (response?.nonce) {
					setRideNonce(response?.nonce, response?.id)
					const tripUpdate = createTripUpdatePayload(response)
					createCarmelTrip({ hotelId: hotelId, createTrip: tripUpdate })
					setPaymentInProgress(true)
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

	const openOrderDetailsAccordion = () => {
		setOpenAccordions(["order-details"])
	}

	const { mutate: fetchAmbassadorCode, isLoading } = useAmbassadorCode({
		onSuccess: (response: any) => {
			const data = response?.data[0]
			if (data) {
				setAmbassadorDetails(data)
				setShowAmbassadorInput(false)
			} else {
				customNotification.error({
					title: "Invalid Code",
					message: "Please enter a valid ambassador code"
				})
				setAmbassadorDetails(null)
				setAmbassadorCode("")
			}
		},
		onError: () => {
			customNotification.error({
				title: "Error",
				message: "Failed to verify ambassador code"
			})
			setAmbassadorDetails(null)
			setAmbassadorCode("")
		}
	})

	return (
		<>
			<RideSubHeader isRideCheckoutScreen={true} />
			<RideCheckoutContainer>
				<Grid gutter={24} justify='center' align='center'>
					<Grid.Col xs={12} sm={8} md={6} lg={4} xl={3}>
						<Flex align='flex-start' mb={12} justify='space-between'>
							<ActionIcon
								onClick={() => {
									router.back()
								}}
								variant='transparent'
							>
								<IconArrowLeft />
							</ActionIcon>
							<RideDetailsText>Your Ride</RideDetailsText>
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
								<Accordion.Control>Ride Details</Accordion.Control>
								<Accordion.Panel sx={{ backgroundColor: "white" }}>
									{ride?.scheduledDate && (
										<ScheduledDate>
											Ride scheduled for:
											<div>{`${ride?.scheduledDate}`}</div>
										</ScheduledDate>
									)}
									{ride?.items !== null ? (
										<>
											<CheckoutItemContainer>
												<Flex justify='space-between'>
													<Flex direction='column' w='100%' mr={6}>
														<ProductDetails>
															<CheckoutCartName
																$sm={isSmallScreen}
															>{`${ride?.items?.name}`}</CheckoutCartName>
															<ProductPrice>
																{showPrice(ride?.items?.price)}
															</ProductPrice>
														</ProductDetails>
													</Flex>

													<Image
														src={ride?.items?.imageUrl}
														alt={ride?.items?.name}
														width={130}
														height={60}
														radius={8}
														fit='contain'
													/>
												</Flex>
											</CheckoutItemContainer>
											<StyledDivider color='gray.3' />
											<Flex justify='space-between' align='center' mt={12}>
												<StyledButton
													variant='transparent'
													onClick={() => {
														setShowAmbassadorInput(true)
														setAmbassadorCode("")
														setAmbassadorDetails(null)
													}}
													style={{ padding: "0px", color: "#228be6" }}
												>
													Add Ambassador Code
												</StyledButton>

												{showAmbassadorInput && (
													<AmbassadorCodeContainer>
														<AmbassadorCodeInput>
															<StyledTextInput
																clearable
																style={{ width: "6rem" }}
																value={ambassadorCode}
																onChange={(event: any) => {
																	setAmbassadorCode(event.target.value)
																}}
																rightSection={
																	<CloseButton
																		aria-label='Clear input'
																		onClick={() => {
																			setAmbassadorCode("")
																			setShowAmbassadorInput(false)
																		}}
																		style={{
																			display: ambassadorCode
																				? undefined
																				: "none"
																		}}
																	/>
																}
															/>
														</AmbassadorCodeInput>
														<StyledButton
															loading={isLoading}
															onClick={() => {
																if (ambassadorCode.trim()) {
																	fetchAmbassadorCode({
																		ambassadorCode: ambassadorCode,
																		airportCode: rideForm.airport,
																		webCode: currentHotelDetails?.webCode
																	})
																}
															}}
														>
															{!isLoading && <IconCheck stroke={2} size={16} />}
														</StyledButton>
													</AmbassadorCodeContainer>
												)}
											</Flex>

											{ambassadorDetails && (
												<AmbassadorSuccessContainer>
													<IconCheck size={16} stroke={2} color='green' />
													<AmbassadorName>
														Ambassador: {ambassadorDetails.ambassador_name}
													</AmbassadorName>
												</AmbassadorSuccessContainer>
											)}
											{/* TODO: Uncomment the below to add back the promo code */}
											{/* <Flex justify='space-between' align='center' mt={12}>
												<StyledButton
													variant={"transparent"}
													onClick={() => {
														setShowPromoCodeInput(true)
														setRideVoucherCode("")
													}}
													style={{ padding: "0px", color: "#228be6" }}
												>
													Add Promo Code
												</StyledButton>
												{voucher?.type && !showPromoCodeInput && (
													<VoucherAppliedContainer>
														<VoucherCodeText>
															{voucherCode ?? "-"}
														</VoucherCodeText>
														<CloseButton
															onClick={() => {
																setRideVoucher(null)
																setRideVoucherCode("")
																queryString([
																	{ fieldName: "voucher", value: "" }
																])
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
																setRideVoucherCode(event.target.value)
															}}
															rightSection={
																<CloseButton
																	aria-label='Clear input'
																	onClick={() => {
																		setRideVoucher(null)
																		setRideVoucherCode("")
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
																	hotelId: currentHotelDetails?.id
																})
																setShowPromoCodeInput(false)
															}}
														>
															<IconCheck stroke={2} size={16} />
														</StyledButton>
													</Flex>
												)}
											</Flex> */}
											<RideCartPriceContainer>
												<RideCartSubtotalPrice>
													<div>Service fee includes tax, toll, and tip.</div>
												</RideCartSubtotalPrice>
												{toNumber(ride?.items?.baseFare) > 0 && (
													<ServiceFee>
														<div>Base fare</div>
														<div>{showPrice(ride?.items?.baseFare)}</div>
													</ServiceFee>
												)}
												{toNumber(ride?.items?.serviceFee) > 0 && (
													<ServiceFee>
														<div>Service fee</div>
														<div>{showPrice(ride?.items?.serviceFee)}</div>
													</ServiceFee>
												)}
												{toNumber(totalDifference) > 0 && (
													<RideDiscountAmount>
														<div>Discount</div>
														<div>- {showPrice(totalDifference)}</div>
													</RideDiscountAmount>
												)}
												<RideCartTotalPrice>
													<div>Total</div>
													<div>{showPrice(totalPrice)}</div>
												</RideCartTotalPrice>
												<StyledDivider />
											</RideCartPriceContainer>
										</>
									) : (
										<EmptyRideCartContainer>
											<Image
												src='/empty-cart.svg'
												alt='Empty cart'
												width={250}
											/>
											<EmptyRideCartLabel>
												<div>Your cart is empty</div>
											</EmptyRideCartLabel>
										</EmptyRideCartContainer>
									)}
								</Accordion.Panel>
							</Accordion.Item>
							<Accordion.Item value='account-information'>
								<Accordion.Control>Account Information</Accordion.Control>
								<Accordion.Panel sx={{ backgroundColor: "white" }}>
									<Grid.Col>
										<StyledTextInput
											label='First name'
											required
											{...form.getInputProps("clientFirstName")}
											onChange={(clientFirstName: any) => {
												form.setFieldValue(
													"clientFirstName",
													clientFirstName?.target.value
												)
												setRideClientFirstName(clientFirstName?.target.value)
											}}
										/>
										<StyledTextInput
											label='Last name'
											required
											{...form.getInputProps("clientLastName")}
											onChange={(clientLastName: any) => {
												form.setFieldValue(
													"clientLastName",
													clientLastName?.target.value
												)
												setRideClientLastName(clientLastName?.target.value)
											}}
										/>

										<StyledCountryPhoneNumber
											label='Phone number'
											value={form.getInputProps("clientNumber").value}
											onChange={(
												value: any,
												data: any,
												event: any,
												formattedValue: any
											) => {
												form.setFieldValue("clientNumber", formattedValue)
												setRideClientNumber(formattedValue)
											}}
											error={form.errors.clientNumber}
										/>
										<StyledTextInput
											label='Email'
											required
											mb={12}
											{...form.getInputProps("clientEmail")}
											onChange={(clientEmail: any) => {
												form.setFieldValue(
													"clientEmail",
													clientEmail?.target.value
												)
												setRideClientEmail(clientEmail?.target.value)
											}}
										/>
									</Grid.Col>
								</Accordion.Panel>
							</Accordion.Item>
							{parseFloat(totalPrice) > 0.5 ? (
								<Accordion.Item value='payment-information'>
									<Accordion.Control>Payment Information</Accordion.Control>
									<Accordion.Panel
										sx={{ backgroundColor: "white", padding: "1rem" }}
									>
										<Elements stripe={stripePromise} options={stripeOptions}>
											<StripePaymentsElement
												setPaymentEnabled={setPaymentEnabled}
												setPaymentInProgress={setPaymentInProgress}
												paymentRef={paymentElementRef}
												openOrderDetailsAccordion={openOrderDetailsAccordion}
												isRideBooking={true}
												cancelOrder={cancelOrder}
											/>
										</Elements>
									</Accordion.Panel>
								</Accordion.Item>
							) : null}
						</Accordion>
						<Flex direction={"row"}>
							<RefundPolicyText>
								Refund Policy: Cancel over 30 mins ahead for a full refund,
								10-30 mins for 50% back on base fare and service fee, or less
								than 10 mins for a refund of only tips, taxes, and tolls*.
							</RefundPolicyText>
						</Flex>
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
									const rideFareIdExists = rideOptions.filter(
										(rideOption: any) =>
											rideOption.carClassDesc.toLowerCase().trim() ===
											ride?.items?.name.toLowerCase().trim()
									)

									if (rideFareIdExists[0]?.fare?.fareId !== ride?.items?.id) {
										customNotification.error({
											message: "Please select a valid ride option"
										})
										router.push(`/${hotelId}/rides/${merchantId}`)
										setOpenChangeRideForm(true)
										return
									}

									if (
										!validateScheduleRideTime(
											ride?.scheduledDate,
											currentHotelDetails?.timezone
										)
									) {
										customNotification.error({
											title: "Unable to book ride",
											message:
												"Please schedule the ride at least 15 minutes ahead"
										})
										setRideFormValue({
											...rideForm,
											travelDate: null,
											travelTime: ""
										})
										router.push(`/rides/${merchantId}`)
										setOpenChangeRideForm(true)
										return
									}
									createOrder({
										tip: (ride?.items?.serviceFee ?? 0)?.toString(),
										comment: ride?.comment,
										hotelId: currentHotelDetails?.id,
										merchantId: carmelMerchantId,
										mealPeriodId: carmelMealPeriodId,
										orderType: PAYMENT_METHOD.CREDIT_CARD.value,
										clientName:
											ride.clientFirstName + " " + ride.clientLastName,
										roomNumber: "",
										clientEmail: ride.clientEmail,
										clientNumber: `${ride?.clientNumber}`,
										voucherCodeId: ride?.voucher?.id,
										numberOfCutleries: "1",
										scheduledDate: ride?.scheduledDate || "",
										items: [],
										hasAlcohol: false,
										isCatering: false,
										rideGrandTotal: ride?.items?.price,
										referralId: ambassadorDetails?.id || null
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
			</RideCheckoutContainer>
		</>
	)
}

export default RideCheckout
