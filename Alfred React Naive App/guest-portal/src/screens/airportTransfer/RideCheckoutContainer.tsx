/* eslint-disable unicorn/prefer-string-replace-all */
import { View, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import LoadingScreen from '@/src/components/ui/loading-screen'
import useCarmelRideList from '@/src/hooks/useCarmelRideList'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { useRideStore } from '@/src/store/useRideStore'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { SnackbarType } from '@/src/types/others'
import { convertTo24Hour } from '@/src/utils/time-utils/convertTo24Hour'
import { format } from 'date-fns'
import { useLocalSearchParams, router } from 'expo-router'
import StickyCheckoutSection from './components/StickyCheckoutSection'
import { Text } from '@components/ui/text'
import { formatTime } from '@/src/utils/time-utils/formatTimeInClockFormat'
import RideDetails from './components/RideDetails'
import { Controller, useForm } from 'react-hook-form'
import { RideCheckoutFormValues } from '@/src/types/ride-types'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptionsMode } from '@stripe/stripe-js'
import CustomTextInput from '@/src/components/ui/CustomTextInput'
import {
	DEFAULT_TIMEZONE,
	EMAIL_VALIDATION_REGEX,
	PAYMENT_METHOD
} from '@/src/utils/constants'
import StyledCountryPhoneNumber from '@/src/components/ui/StyledCountryPhoneNumber'
import validateCountryPhoneNumber from '@/src/utils/validation-utils/validateCountryPhoneNumber'
import ConsentSection from './components/ConsentSection'
import useCancelOrder from '@/src/hooks/useCancelOrder'
import useCreateTrip from '@/src/hooks/useCreateTrip'
import usePaymentInit from '@/src/hooks/usePaymentInit'
import useCreateOrder from '@/src/hooks/useCreateOrder'
import StripePaymentsElement from './components/StripePaymentsElement'
import { validateScheduleRideTime } from '@/src/utils/time-utils/validateScheduleRideTime'
import { formatInTimeZone } from 'date-fns-tz'
import { RadioButton } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { WarningIcon } from '@/src/components/ui/icons/WarningIcon'

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_KEY as string)
const RideCheckoutContainer = () => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()
	const { setCurrentHotelId, showLoadingScreen, setPaymentPending } =
		useGlobalStore()
	const [paymentEnabled, setPaymentEnabled] = useState(false)
	const [paymentInProgress, setPaymentInProgress] = useState(false)
	const [paymentFailed, setPaymentFailed] = useState(false)
	const paymentElementReference = useRef<any>(null)
	const [paymentMethod, setPaymentMethod] = useState('creditCard')
	const {
		rideForm,
		rideScheduledDate,
		timeValue,
		selectedRide,
		pickUpAddress,
		dropOffAddress,
		setRideOptions,
		setRideNonce,
		rideOptions,
		setRideFormValue,
		rideNonce,
		clientEmail,
		clientFirstName,
		clientLastName,
		clientNumber,
		setRideClientEmail,
		setRideClientFirstName,
		setRideClientLastName,
		setRideClientNumber,
		ambassadorDetails
	} = useRideStore()

	const { setSnackbarMessage } = useSnackbarStore()

	const { currentHotelDetails, carmelMerchantId, carmelMealPeriodId } =
		useGlobalStore()

	useEffect(() => {
		setCurrentHotelId(hotelId)
	}, [])

	const {
		control,
		formState: { isValid, errors },
		setError,
		clearErrors
	} = useForm<RideCheckoutFormValues>({
		defaultValues: {
			clientFirstName: clientFirstName,
			clientLastName: clientLastName,
			clientEmail: clientEmail,
			clientNumber: clientNumber
		},
		mode: 'onChange'
	})

	const stripePaymentOptions: StripeElementsOptionsMode = {
		mode: 'payment',
		amount: Math.round((selectedRide?.price ?? 0) * 100),
		currency: 'usd',
		clientSecret: undefined,
		payment_method_types: ['card']
	}

	const { mutate: cancelOrder } = useCancelOrder({
		onSuccess: () => {
			setPaymentInProgress(false)
			setPaymentFailed(true)
			router.back()
		},
		onError: () => {
			setPaymentFailed(true)
		}
	})

	const { mutate: createCarmelTrip } = useCreateTrip({
		onSuccess: (result: any) => {
			if (result?.length > 0) {
				paymentInit({
					orderId: rideNonce,
					amount: (selectedRide?.price ?? 0) * 100,
					paymentMethodType: 'card',
					clientName: clientFirstName + ' ' + clientLastName,
					clientNumber: `${clientNumber}`,
					clientEmail: clientEmail,
					isRideService: true
				})
				setPaymentInProgress(true)
			} else {
				setSnackbarMessage(
					true,
					SnackbarType.ERROR,
					'Failed',
					'Unable to book rides right now. Please try again later!'
				)
				router.push(`/${hotelId}`)
			}
		},
		onError: () => {
			setSnackbarMessage(
				true,
				SnackbarType.ERROR,
				'Failed',
				'Unable to book rides right now. Please try again later!'
			)
			router.push(`/${hotelId}`)
		}
	})

	const { mutate: paymentInit, isPending: paymentInitIsLoading } =
		usePaymentInit({
			onSuccess: (result: any) => {
				if (result?.data?.[0]?.clientSecret) {
					paymentElementReference.current?.submit(
						result?.data?.[0]?.clientSecret
					)
				}
			},
			onError: () => {
				setPaymentFailed(true)
			}
		})

	const createTripUpdatePayload = (response: any) => {
		const firstSpaceIndex = clientNumber.indexOf(' ')
		const countryCode = clientNumber.slice(0, firstSpaceIndex).replace('+', '')
		const number = clientNumber
			.slice(firstSpaceIndex + 1)
			.replace(/[\s()-]/g, '')
		return {
			nonce: response?.nonce,
			addressFrom: pickUpAddress,
			addressTo: dropOffAddress,
			tripDate:
				rideForm?.travelDate && format(rideForm?.travelDate, 'MM/dd/yyyy'),
			tripTime: convertTo24Hour(rideForm?.travelTime),
			customerFirstName: clientFirstName,
			customerLastName: clientLastName,
			customerPhone: {
				countryCode: countryCode,
				number: number
			},
			emailAddr: clientEmail,
			carClassID: selectedRide?.carClassId ?? '',
			fareId: selectedRide?.id ?? ''
		}
	}
	const { mutate: createOrder, isPending: createOrderIsLoading } =
		useCreateOrder({
			onSuccess: async (response: any) => {
				if (response?.nonce) {
					setRideNonce(response?.nonce, response?.id)
					const tripUpdate = createTripUpdatePayload(response)
					createCarmelTrip({
						hotelId: currentHotelDetails?.webCode ?? '',
						createTrip: tripUpdate
					})
					setPaymentInProgress(true)
				} else {
					setPaymentFailed(true)
				}
			},
			onError: () => {
				setPaymentFailed(true)
			}
		})

	const paymentPending =
		createOrderIsLoading || paymentInitIsLoading || paymentInProgress

	useEffect(() => {
		if (paymentPending) {
			setPaymentPending(true)
		}
	}, [paymentPending])

	if (showLoadingScreen) {
		return <LoadingScreen visible={showLoadingScreen} />
	}
	return (
		<View>
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
			<View className='bg-blue-600 py-[10]'>
				<View className='flex-row items-center justify-center gap-[12]'>
					{rideScheduledDate ? (
						<>
							<Text className='text-white text-center' variant='p2Medium'>
								{`${formatInTimeZone(new Date(rideScheduledDate), currentHotelDetails?.timezone || DEFAULT_TIMEZONE, "MMMM do, yyyy 'at' h:mm a")} to ${rideForm.airport}`}
							</Text>
							<Pressable
								onPress={() => {
									router.push(`/${hotelId}/airport-transfer`)
									setRideOptions([])
								}}
							>
								<Text
									className='text-white border-b border-white'
									variant='p2Medium'
								>
									{`edit`}
								</Text>
							</Pressable>
						</>
					) : null}
				</View>
			</View>

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

			<ScrollView className='flex-1 h-full bg-gray-300 '>
				<RideDetails />
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
									label={'First Name'}
									value={value}
									onChangeText={(event: any) => {
										onChange(event?.target.value)
										setRideClientFirstName(event?.target.value)
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
										setRideClientLastName(event?.target.value)
									}}
									error={errors.clientLastName}
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
										setRideClientEmail(event?.target.value)
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
											setRideClientNumber(formattedValue)
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
					{selectedRide && selectedRide.price > 0.5 ? (
						<View>
							<RadioButton.Group
								onValueChange={value => setPaymentMethod(value)}
								value={paymentMethod}
							>
								<Pressable
									onPress={() => setPaymentMethod('creditCard')}
									className='flex-row items-center mt-[12]'
								>
									<RadioButton value='creditCard' color='#2454A4' />
									<Text variant='p2Medium' className='text-primary-950'>
										Credit Card
									</Text>
								</Pressable>

								{paymentMethod === 'creditCard' && (
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
												isRideBooking={true}
											/>
										</Elements>
									</View>
								)}
							</RadioButton.Group>
						</View>
					) : null}
					<ConsentSection />
				</View>
			</ScrollView>
			<StickyCheckoutSection
				buttonText='Place Order'
				selectedRide={selectedRide}
				timeLeft={formatTime(timeValue)}
				disabled={
					createOrderIsLoading ||
					paymentInitIsLoading ||
					paymentInProgress ||
					!paymentEnabled ||
					!isValid
				}
				isLoading={
					createOrderIsLoading || paymentInitIsLoading || paymentInProgress
				}
				onProceed={() => {
					const rideFareIdExists = rideOptions?.filter(
						(rideOption: any) =>
							rideOption.carClassDesc.toLowerCase().trim() ===
							selectedRide?.name.toLowerCase().trim()
					)

					if (rideFareIdExists[0]?.fare?.fareId !== selectedRide?.id) {
						setPaymentFailed(true)
						router.push(`/${hotelId}/airport-transfer/${carmelMerchantId}`)
						return
					}

					if (
						!validateScheduleRideTime(
							rideScheduledDate,
							currentHotelDetails?.timezone || DEFAULT_TIMEZONE
						)
					) {
						setPaymentFailed(true)
						setRideFormValue({
							...rideForm,
							travelDate: null,
							travelTime: ''
						})
						router.push(`/${hotelId}/airport-transfer`)
						return
					}
					createOrder({
						tip: (selectedRide?.serviceFee ?? 0)?.toString(),
						comment: '',
						hotelId: currentHotelDetails?.id ?? 0,
						merchantId: carmelMerchantId,
						mealPeriodId: carmelMealPeriodId,
						orderType: PAYMENT_METHOD.CREDIT_CARD.value,
						clientName: clientFirstName + ' ' + clientLastName,
						roomNumber: '',
						clientEmail: clientEmail,
						clientNumber: `${clientNumber}`,
						voucherCodeId: 0,
						numberOfCutleries: '1',
						scheduledDate: rideScheduledDate || '',
						items: [],
						hasAlcohol: false,
						isCatering: false,
						rideGrandTotal: selectedRide?.price,
						referralId: ambassadorDetails?.id || null
					})
				}}
			/>
		</View>
	)
}

export default RideCheckoutContainer
