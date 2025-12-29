/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import { View } from 'react-native'
import { Text } from '@components/ui/text'
import { useForm, Controller } from 'react-hook-form'
import { router } from 'expo-router'
import CustomTextInput from '@/src/components/ui/CustomTextInput'
import StyledCountryPhoneNumber from '@/src/components/ui/StyledCountryPhoneNumber'
import { LoadingButton } from '@components/ui/LoadingButton'
import validateCountryPhoneNumber from '@/src/utils/validation-utils/validateCountryPhoneNumber'
import { useGlobalStore } from '@store/useGlobalStore'
import useConciergeService from '@/src/hooks/useConciergeService'
import { SnackbarType } from '@/src/types/others'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { formatPhoneNumber } from '@/src/utils/validation-utils/formatPhoneNumber'

const ConciergeFormContainer = () => {
	const { currentHotelDetails } = useGlobalStore()
	const hotelId = currentHotelDetails?.id.toString() || ''
	const hotelWebCode = currentHotelDetails?.webCode || ''
	const { setSnackbarMessage } = useSnackbarStore()

	const {
		control,
		handleSubmit,
		formState: { isValid, errors },
		setError,
		clearErrors,
		reset
	} = useForm({
		mode: 'onChange',
		defaultValues: {
			name: '',
			phoneNumber: '',
			roomNumber: ''
		}
	})

	const { mutate: submitGuestInfo, isPending } = useConciergeService({
		onSuccess: (result: { success: any }) => {
			if (result.success) {
				reset()
				router.push(`/${hotelWebCode}/concierge/confirmation`)
			} else {
				setSnackbarMessage(
					true,
					SnackbarType.ERROR,
					'Failure',
					'Failed to register. Please try again.'
				)
			}
		},
		onError: (error: any) => {
			setSnackbarMessage(
				true,
				SnackbarType.ERROR,
				'Failure',
				'An error occurred while registering'
			)
			console.error('Concierge service error:', error)
		}
	})

	const onSubmit = (data: any) => {
		const nameParts = data.name.trim().split(' ')
		const firstName = nameParts[0] || ''
		const lastName = nameParts.slice(1).join(' ') || ''

		const payload = {
			firstName,
			lastName,
			phoneNumber: formatPhoneNumber(data.phoneNumber),
			hotelId: hotelId,
			roomNumber: data.roomNumber
		}

		submitGuestInfo(payload)
	}

	const determineSubmitText = () => {
		if (isPending) return 'Submitting...'
		if (isValid) return 'Submit'
		return 'Fill Required Fields'
	}

	return (
		<View className='flex-1 relative'>
			<View className='m-[12] gap-[12] relative' style={{ zIndex: 2 }}>
				<Controller
					control={control}
					name='name'
					rules={{
						required: 'Name is required',
						minLength: {
							value: 2,
							message: 'Name must be at least 2 characters'
						}
					}}
					render={({ field: { value, onChange } }) => (
						<View className='mt-[6]'>
							<CustomTextInput
								label='Full Name'
								value={value}
								onChangeText={e => onChange(e.nativeEvent.text)}
								error={errors.name}
							/>
						</View>
					)}
				/>

				<View className='relative my-3' style={{ zIndex: 999 }}>
					<Controller
						control={control}
						name='phoneNumber'
						key='phoneNumber'
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
								label='Phone Number'
								value={value}
								onChange={(
									value: any,
									data: any,
									event: any,
									formattedValue: string
								) => {
									const isValidPhoneNumber =
										validateCountryPhoneNumber(formattedValue)

									if (isValidPhoneNumber?.isValid) {
										clearErrors('phoneNumber')
										onChange(formattedValue)
									} else {
										setError('phoneNumber', {
											type: 'custom',
											message: isValidPhoneNumber?.errorMessage
										})
									}
								}}
								error={errors.phoneNumber}
							/>
						)}
					/>
				</View>

				<Controller
					control={control}
					name='roomNumber'
					render={({ field: { value, onChange } }) => (
						<View className='mt-[6]'>
							<CustomTextInput
								label='Room Number'
								value={value}
								onChangeText={e => onChange(e.nativeEvent.text)}
								error={errors.roomNumber}
							/>
						</View>
					)}
				/>
			</View>

			<View className='px-[20] pt-[8] pb-[10] relative' style={{ zIndex: 1 }}>
				<LoadingButton
					isLoading={isPending}
					disabled={!isValid || isPending}
					className={`rounded-full w-full h-[54] flex items-center justify-center ${
						isValid && !isPending ? 'bg-primary-950' : `bg-tabInactiveColor-500`
					}`}
					onPress={handleSubmit(onSubmit)}
				>
					<Text variant='p2Medium' className='font-extrabold text-white'>
						{determineSubmitText()}
					</Text>
				</LoadingButton>
			</View>
		</View>
	)
}

export default ConciergeFormContainer
