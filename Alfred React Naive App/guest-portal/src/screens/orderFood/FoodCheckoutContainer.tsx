import { View, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import useCancelOrder from '@/src/hooks/useCancelOrder'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { SnackbarType } from '@/src/types/others'
import { loadStripe, StripeElementsOptionsMode } from '@stripe/stripe-js'
import { Controller, useForm } from 'react-hook-form'
import LoadingScreen from '@/src/components/ui/loading-screen'
import CustomTextInput from '@/src/components/ui/CustomTextInput'
import StyledCountryPhoneNumber from '@/src/components/ui/StyledCountryPhoneNumber'
import {
	DEFAULT_IN_HOUSE_DELIVERY_FEE_AMOUNT_USD,
	DEFAULT_TIMEZONE,
	EMAIL_VALIDATION_REGEX,
	PAYMENT_METHOD
} from '@/src/utils/constants'
import validateCountryPhoneNumber from '@/src/utils/validation-utils/validateCountryPhoneNumber'
import { Ionicons } from '@expo/vector-icons'
import { Elements } from '@stripe/react-stripe-js'
import { formatInTimeZone } from 'date-fns-tz'
import { RadioButton } from 'react-native-paper'
import ConsentSection from '../airportTransfer/components/ConsentSection'
import StripePaymentsElement from '../airportTransfer/components/StripePaymentsElement'
import { Text } from '@components/ui/text'
import { useCartStore } from '@/src/store/useCartStore'
import { FoodCheckoutFormValues } from '@/src/types/order-types'
import areSimilarCoordinates from '@/src/utils/validation-utils/areSimilarCoordinates'
import { StickyCheckoutButton } from './components/review-order-items/StickyCheckoutButton'
import CheckoutDetailsContainer from './components/CheckoutDetailsContainer'
import { calculateDeliveryFee } from '@/src/utils/validation-utils/calculateDeliveryFee'
import usePaymentInit from '@/src/hooks/usePaymentInit'
import useCreateOrder from '@/src/hooks/useCreateOrder'
import formatScheduledOrderDateTime from '@/src/utils/time-utils/formatScheduledOrderDateTime'
import useTotalPrice from '@/src/utils/validation-utils/calculateTotalPrice'
import { EmptyBagIcon } from '@/src/components/ui/icons/EmptyBagIcon'
import { WarningIcon } from '@/src/components/ui/icons/WarningIcon'

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_KEY as string)

const FoodCheckoutContainer = () => {
	const { hotelId, merchantId } = useLocalSearchParams<{
		hotelId: string
		merchantId: string
	}>()
	const {
		currentHotelDetails,
		selectedMerchantCoordinates,
		merchantDetails,
		setPaymentPending,
		setCurrentHotelId,
		showLoadingScreen,
		setShowPaymentInProgressModal
	} = useGlobalStore()
	const [paymentEnabled, setPaymentEnabled] = useState(false)
	const [paymentInProgress, setPaymentInProgress] = useState(false)
	const [paymentFailed, setPaymentFailed] = useState(false)

	const paymentElementReference = useRef<any>(null)

	const isRoomChargeAllowed =
		currentHotelDetails?.allowRoomCharge &&
		areSimilarCoordinates(
			currentHotelDetails?.coordinates,
			selectedMerchantCoordinates
		)

	const [paymentMethod, setPaymentMethod] = useState(
		isRoomChargeAllowed ? '' : PAYMENT_METHOD.CREDIT_CARD.value
	)

	const {
		order,
		setOrderClientEmail,
		setOrderClientNumber,
		setOrderRoomNumber,
		setOrderClientFirstName,
		setOrderClientLastName,
		clientFirstName,
		clientLastName,
		clientEmail,
		clientNumber,
		roomNumber,
		deliveryFee,
		tipByUser,
		setOrderId,
		resetOrder,
		mealPeriodId
	} = useCartStore()

	const { setSnackbarMessage } = useSnackbarStore()

	useEffect(() => {
		setCurrentHotelId(hotelId)
	}, [])

	const {
		control,
		formState: { isValid, errors },
		setError,
		clearErrors
	} = useForm<FoodCheckoutFormValues>({
		defaultValues: {
			clientFirstName: clientFirstName,
			clientLastName: clientLastName,
			clientRoomNumber: roomNumber,
			clientEmail: clientEmail,
			clientNumber: clientNumber
		},
		mode: 'onChange'
	})

	const { mutate: paymentInit, isPending: paymentInitIsLoading } =
		usePaymentInit({
			onSuccess: (result: any) => {
				if (result?.data?.[0]?.clientSecret) {
					paymentElementReference.current?.submit(
						result?.data?.[0]?.clientSecret
					)
				} else {
					// if (campaign_uid && short_code) {
					// 	createReferralRecord({
					// 		amount: totalPrice,
					// 		orderId: result?.data?.[0]?.orderId,
					// 		clientName: order?.clientName,
					// 		clientEmail: order?.clientEmail,
					// 		campaignUid: campaign_uid,
					// 		shortCode: short_code
					// 	})
					// }
					setShowPaymentInProgressModal(false)
					setPaymentInProgress(false)
					router.push(
						`/order-status/${result?.data?.[0]?.orderId}?orderStatus=success`
					)
				}
			},
			onError: () => {
				setPaymentFailed(true)
			}
		})

	const { mutate: createOrder, isPending: createOrderIsLoading } =
		useCreateOrder({
			onSuccess: async (response: any) => {
				if (response?.nonce) {
					setOrderId(response?.id, response?.nonce)
					if (response?.order_type === PAYMENT_METHOD.CREDIT_CARD.value) {
						paymentInit({
							orderId: response?.nonce,
							amount: Number.parseFloat(totalPrice) * 100,
							paymentMethodType: 'card',
							clientName: clientFirstName + ' ' + clientLastName,
							clientNumber: `${clientNumber}`,
							clientEmail: clientEmail
						})
					} else {
						// if (campaign_uid && short_code) {
						// 	createReferralRecord({
						// 		amount: totalPrice,
						// 		orderId: response?.nonce,
						// 		clientName: order?.clientName,
						// 		clientEmail: order?.clientEmail,
						// 		campaignUid: campaign_uid,
						// 		shortCode: short_code
						// 	})
						// }
						setPaymentPending(false)
						setShowPaymentInProgressModal(false)
						router.push(`/order-status/${response?.nonce}?orderStatus=success`)
						resetOrder()
					}
				} else {
					setPaymentPending(false)
					setShowPaymentInProgressModal(false)
					setSnackbarMessage(
						true,
						SnackbarType.ERROR,
						'Failure',
						'Something went wrong. Please try again'
					)
				}
			},
			onError: () => {
				setSnackbarMessage(
					true,
					SnackbarType.ERROR,
					'Failure',
					'Something went wrong. Please try again'
				)
			}
		})

	const selectedMerchantDetails = merchantDetails.find(merchant => {
		return merchant.id === +merchantId
	})

	const hasDeliveryFee = areSimilarCoordinates(
		currentHotelDetails?.coordinates,
		selectedMerchantCoordinates
	)
		? false
		: currentHotelDetails?.hasDeliveryFee

	const { mutate: cancelOrder } = useCancelOrder({
		onSuccess: () => {
			setPaymentInProgress(false)
			setSnackbarMessage(
				true,
				SnackbarType.ERROR,
				'Payment failed',
				'The payment has failed, Please try again!'
			)
			router.back()
		},
		onError: () => {
			setPaymentFailed(true)
		}
	})

	const { totalPrice, totalTip } = useTotalPrice({
		voucher: order.voucher,
		tip: tipByUser,
		items: order?.items,
		taxRate: selectedMerchantDetails?.tax_rate || 0,
		isTaxExempt: currentHotelDetails?.isTaxExempt,
		deliveryFee: calculateDeliveryFee(
			hasDeliveryFee ?? true,
			selectedMerchantDetails?.has_third_party_delivery ?? true,
			deliveryFee,
			currentHotelDetails?.deliveryFee ??
				DEFAULT_IN_HOUSE_DELIVERY_FEE_AMOUNT_USD
		),
		hasDeliveryFee: hasDeliveryFee,
		isMandatoryTipEnabled: currentHotelDetails?.enableAutomaticTip,
		isDeliveryInSamePlace: areSimilarCoordinates(
			currentHotelDetails?.coordinates,
			selectedMerchantCoordinates
		),
		tipByUser: order.tip
	})

	const stripePaymentOptions: StripeElementsOptionsMode = {
		mode: 'payment',
		amount: Math.round((Number.parseFloat(totalPrice) ?? 0) * 100),
		currency: 'usd',
		clientSecret: undefined,
		payment_method_types: ['card']
	}

	const paymentPending =
		createOrderIsLoading || paymentInitIsLoading || paymentInProgress

	useEffect(() => {
		if (paymentPending) {
			setPaymentPending(true)
		}
	}, [paymentPending])

	useEffect(() => {
		if (Number.parseFloat(totalPrice) === 0) {
			setPaymentEnabled(true)
		} else if (paymentMethod === PAYMENT_METHOD.ROOM_CHARGE.value) {
			setPaymentEnabled(true)
		}
	}, [totalPrice, paymentMethod])

	if (showLoadingScreen) {
		return <LoadingScreen visible={showLoadingScreen} />
	}

	return (
		<View className='flex-auto'>
			<View className='bg-white px-[20] flex-row items-center justify-between shadow-sm'>
				<Pressable
					onPress={() => {
						if (!paymentPending) {
							router.back()
						}
					}}
				>
					<Ionicons
						name='arrow-back-circle'
						size={30}
						className='text-blue-500'
					/>
				</Pressable>
				<View className='flex-1 py-[12]'>
					<Text variant='h5' className='text-blue-700 text-center'>
						{`Checkout`}
					</Text>
				</View>
				<View className='w-[30]' />
			</View>
			{order.scheduledDate === 'ASAP' ? null : (
				<View className=' bg-blue-600 py-[10]'>
					<View className='flex-row items-center justify-center '>
						<Text className='text-white text-center' variant='p2Medium'>
							{`${formatInTimeZone(new Date(order.scheduledDate), currentHotelDetails?.timezone || DEFAULT_TIMEZONE, "MMMM do, yyyy 'at' h:mm a")}`}
						</Text>
					</View>
				</View>
			)}
			{paymentFailed && (
				<View className='bg-utility-red50 p-4 mx-3 my-3 rounded-lg flex-row items-center justify-between'>
					<View className='flex-row items-center w-full'>
						<WarningIcon width='24' height='24' color='#BA082B' />
						<Text
							variant='p2Medium'
							className='text-utility-red500 ml-2 flex-1'
						>
							{`Payment failed. Please try again or select a different payment method.`}
						</Text>
					</View>
				</View>
			)}

			<View className='flex-1 h-full bg-gray-300 '>
				<CheckoutDetailsContainer />
				<View className='m-[12]'>
					<Text variant='h5' className='font-bold text-blue-700'>
						{`Contact Information`}
					</Text>
					<View className={`mt-[12]`}>
						<Controller
							control={control}
							name='clientFirstName'
							key={'clientFirstName'}
							rules={{ required: ' First name is required' }}
							render={({ field: { value, onChange } }) => (
								<CustomTextInput
									label={'Name'}
									value={value}
									onChangeText={(event: any) => {
										onChange(event?.target.value)
										setOrderClientFirstName(event?.target.value)
									}}
									error={errors.clientFirstName}
								/>
							)}
						/>
					</View>
					<View className={`mt-[12]`}>
						<Controller
							control={control}
							name='clientLastName'
							key={'clientLastName'}
							rules={{ required: 'Last name is required' }}
							render={({ field: { value, onChange } }) => (
								<CustomTextInput
									label={'Last Name'}
									value={value}
									onChangeText={(event: any) => {
										onChange(event?.target.value)
										setOrderClientLastName(event?.target.value)
									}}
									error={errors.clientLastName}
								/>
							)}
						/>
					</View>
					<View className={`mt-[12]`}>
						<Controller
							control={control}
							name='clientRoomNumber'
							key={'clientRoomNumber'}
							rules={{ required: 'Room number is required' }}
							render={({ field: { value, onChange } }) => (
								<CustomTextInput
									label={'Room Number'}
									value={value}
									onChangeText={(event: any) => {
										onChange(event?.target.value)
										setOrderRoomNumber(event?.target.value)
									}}
									error={errors.clientRoomNumber}
								/>
							)}
						/>
					</View>
					<View className={`mt-[12]`}>
						<Controller
							control={control}
							name='clientEmail'
							key={'clientEmail'}
							rules={{
								required: 'Email is required',
								pattern: {
									value: EMAIL_VALIDATION_REGEX,
									message: 'Invalid email address'
								}
							}}
							render={({ field: { value, onChange } }) => (
								<CustomTextInput
									label={'Email'}
									value={value}
									onChangeText={(event: any) => {
										onChange(event?.target.value)
										setOrderClientEmail(event?.target.value)
									}}
									error={errors.clientEmail}
								/>
							)}
						/>
					</View>
					<View className={`mt-[12] z-[10]`}>
						<Controller
							control={control}
							name='clientNumber'
							key={'clientNumber'}
							rules={{
								required: 'Phone number is required',
								validate: value => {
									const isValidPhoneNumber = validateCountryPhoneNumber(value)
									return (
										isValidPhoneNumber?.isValid ||
										isValidPhoneNumber?.errorMessage
									)
								}
							}}
							render={({ field: { value, onChange } }) => (
								<StyledCountryPhoneNumber
									label='Phone number'
									value={value}
									onChange={(
										value: any,
										data: any,
										event: any,
										formattedValue: any
									) => {
										const isValidPhoneNumber =
											validateCountryPhoneNumber(formattedValue)

										if (isValidPhoneNumber?.isValid) {
											clearErrors('clientNumber')
											onChange(formattedValue)
											setOrderClientNumber(formattedValue)
										} else {
											setError('clientNumber', {
												type: 'custom',
												message: isValidPhoneNumber?.errorMessage
											})
										}
									}}
									error={errors?.clientNumber}
								/>
							)}
						/>
					</View>

					<Text variant='h5' className='font-bold text-blue-700 mt-[12]'>
						{`Payment`}
					</Text>

					<View>
						<RadioButton.Group
							onValueChange={value => setPaymentMethod(value)}
							value={paymentMethod}
						>
							<Pressable
								onPress={() =>
									setPaymentMethod(PAYMENT_METHOD.CREDIT_CARD.value)
								}
								className='flex-row items-center mt-[12]'
							>
								<RadioButton
									value={PAYMENT_METHOD.CREDIT_CARD.value}
									color='#2454A4'
								/>
								<Text variant='p2Medium' className='text-primary-950'>
									{PAYMENT_METHOD.CREDIT_CARD.label}
								</Text>
							</Pressable>

							{paymentMethod === PAYMENT_METHOD.CREDIT_CARD.value &&
								Number.parseFloat(totalPrice) > 0.5 && (
									<View className='mt-[12] p-[12] border-2 border-white rounded-lg'>
										<Elements
											stripe={stripePromise}
											options={stripePaymentOptions}
										>
											<StripePaymentsElement
												setPaymentEnabled={setPaymentEnabled}
												setPaymentInProgress={setPaymentInProgress}
												cancelOrder={cancelOrder}
												paymentRef={paymentElementReference}
											/>
										</Elements>
									</View>
								)}

							{isRoomChargeAllowed ? (
								<View>
									<Pressable
										onPress={() => {
											setPaymentMethod(PAYMENT_METHOD.ROOM_CHARGE.value)
										}}
										className='flex-row items-center mt-[12]'
									>
										<RadioButton
											value={PAYMENT_METHOD.ROOM_CHARGE.value}
											color='#2454A4'
										/>
										<Text variant='p2Medium' className='text-primary-950'>
											{PAYMENT_METHOD.ROOM_CHARGE.label}
										</Text>
									</Pressable>

									{paymentMethod === PAYMENT_METHOD.ROOM_CHARGE.value && (
										<View className='p-[12] gap-[8] bg-blue-100 flex-row items-center justify-between'>
											<EmptyBagIcon width='20' height='20' color='#052151' />
											<Text variant='p2Medium' className='text-primary-950'>
												{`The order value will automatically be added to your hotel bill.`}
											</Text>
										</View>
									)}
								</View>
							) : null}
						</RadioButton.Group>
					</View>
					<ConsentSection />
				</View>
			</View>
			<StickyCheckoutButton
				buttonText='Place Order'
				disabled={
					createOrderIsLoading ||
					paymentInitIsLoading ||
					paymentInProgress ||
					!paymentEnabled ||
					!isValid
				}
				loading={
					createOrderIsLoading || paymentInitIsLoading || paymentInProgress
				}
				onPress={() => {
					let formatedScheduledDate = null

					if (order?.scheduledDate !== 'ASAP') {
						formatedScheduledDate = formatScheduledOrderDateTime(
							order?.scheduledDate,
							currentHotelDetails?.timezone || DEFAULT_TIMEZONE
						)
					}
					// if (!validateScheduleOrderTime(order?.scheduledDate)) {
					// 	setSnackbarMessage(
					// 		true,
					// 		SnackbarType.ERROR,
					// 		'Schedule Order Failed',
					// 		`Your scheduled order time is too soon. Please reschedule to a time at least 1 hour from now.`
					// 	)
					// 	return
					// }
					createOrder({
						tip: Number.parseFloat(totalTip) > 0 ? totalTip : '0',
						comment: order?.comment,
						hotelId: currentHotelDetails?.id ?? 0,
						mealPeriodId: mealPeriodId ?? 0,
						orderType: paymentMethod,
						clientName: clientFirstName + ' ' + clientLastName,
						roomNumber: roomNumber,
						clientEmail: clientEmail,
						clientNumber: `${clientNumber}`,
						voucherCodeId: order?.voucher?.id,
						numberOfCutleries: order?.numberOfCutleries.toString(),
						scheduledDate: formatedScheduledDate,
						items: order.items?.map((item: any) => {
							const { id, quantity } = item
							const modifierData = item?.modifiers?.map((modifier: any) => {
								const { id, options } = modifier
								const optionsData = options.map((option: any) => ({
									id: option.id,
									quantity: option.quantity
								}))
								return { id, options: optionsData }
							})
							return { id, quantity, modifiers: modifierData }
						}),
						hasAlcohol: order.hasAlcohol,
						isCatering: false,
						merchantId: +merchantId,
						rideGrandTotal: 0
					})
				}}
			/>
		</View>
	)
}

export default FoodCheckoutContainer
