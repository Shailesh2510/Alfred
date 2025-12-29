/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import { View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Text } from '@components/ui/text'
import { router, useLocalSearchParams } from 'expo-router'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { useRideStore } from '@/src/store/useRideStore'
import useCarmelRideList from '@/src/hooks/useCarmelRideList'
import { format } from 'date-fns-tz'
import { useForm, Controller } from 'react-hook-form'
import { convertTo24Hour } from '@/src/utils/time-utils/convertTo24Hour'
import { airportCoordinates } from '@/src/utils/constants'
import CustomElementDropdown from '@/src/components/ui/CustomDropdown'
import { Ionicons } from '@expo/vector-icons'
import CustomDatePicker from '@/src/components/ui/CustomDatePicker'
import { validateScheduleRideTime } from '@/src/utils/time-utils/validateScheduleRideTime'
import { SnackbarType } from '@/src/types/others'
import { generateTimeOptionsInEst } from '@/src/utils/time-utils/generateTimeOptionsInEst'
import { RideFormValues } from '@/src/types/ride-types'
import { LoadingButton } from '@components/ui/LoadingButton'

const handleRideTime = (
	selectedDate: Date | null,
	selectedTimeString: string
) => {
	if (selectedDate && selectedTimeString) {
		const zonedDate = new Date(format(selectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX"))
		const [timeString, period] = selectedTimeString.split(' ')
		const [hourString, minuteString] = timeString.split(':')
		let hour = Number.parseInt(hourString)
		const minute = Number.parseInt(minuteString)

		if (period === 'PM' && hour !== 12) {
			hour += 12
		}
		if (period === 'AM' && hour === 12) {
			hour = 0
		}

		const dateWithTime = new Date(zonedDate)
		dateWithTime.setHours(hour, minute, 0)

		const formattedDate = format(dateWithTime, 'MM/dd/yyyy hh:mm a')
		return `${formattedDate}`
	}
	return null
}

const RideFormContainer = () => {
	const { hotelId } = useLocalSearchParams<{ hotelId: string }>()
	const [timeOptions, setTimeOptions] = useState<string[]>([])
	const { setSnackbarMessage } = useSnackbarStore()
	const {
		setRideOptions,
		setRideScheduledDate,
		setRideFormValue,
		rideForm,
		setOpenChangeRideForm,
		removeRide,
		setTimeValue,
		setRideScheduledTime,
		rideScheduledTime,
		setPickUpAddress,
		setDropOffAddress
	} = useRideStore()

	const { currentHotelDetails, carmelMerchantId } = useGlobalStore()

	const {
		control,
		setValue,
		watch,
		formState: { isValid },
		reset
	} = useForm<RideFormValues>({
		mode: 'onChange'
	})

	const formValues = watch()

	const { mutate: fetchPriceListFromCarmel, isPending } = useCarmelRideList({
		onSuccess: (result: any) => {
			if (result.data.length > 0) {
				setRideOptions(result?.data)
				setOpenChangeRideForm(false)
				setTimeValue(result?.data[0]?.fare?.expiresIn || 0)
				router.push(`/${hotelId}/airport-transfer/${carmelMerchantId}`)
			} else {
				setSnackbarMessage(
					true,
					SnackbarType.ERROR,
					'Failure',
					'Unable to find any rides'
				)
			}
		},
		onError: () => {
			setSnackbarMessage(
				true,
				SnackbarType.ERROR,
				'Failure',
				'Unable to find any rides'
			)
		}
	})

	useEffect(() => {
		if (currentHotelDetails && formValues.travelDate) {
			setTimeOptions(
				generateTimeOptionsInEst(
					formValues.travelDate,
					currentHotelDetails?.timezone
				)
			)
		}
	}, [formValues.travelDate])

	useEffect(() => {
		if (rideForm) {
			reset({
				airport: rideForm.airport || '',
				travelDate: rideForm.travelDate || null,
				travelTime: rideForm.travelTime || ''
			})
		}
	}, [rideForm, reset])

	const handleFindRideSubmit = (rideScheduledDate: string | null) => {
		setRideScheduledDate(rideScheduledDate)
		setRideFormValue({ ...formValues, travelTime: rideScheduledTime })
		const pickUpAddress = {
			streetName: currentHotelDetails?.addressStreet || '',
			cityName: currentHotelDetails?.cityName || '',
			streetNumber: currentHotelDetails?.addressNumber || '',
			latitude: currentHotelDetails?.coordinates.x || 0,
			longitude: currentHotelDetails?.coordinates.y || 0,
			airport: false
		}

		const dropOffAddress = {
			airport: true,
			airportCode: formValues.airport,
			latitude: airportCoordinates[formValues.airport]?.latitude || 0,
			longitude: airportCoordinates[formValues.airport]?.longitude || 0
		}
		const priceListPayload = {
			addressFrom: pickUpAddress,
			addressTo: dropOffAddress,
			tripDate:
				formValues.travelDate && format(formValues.travelDate, 'MM/dd/yyyy'),
			tripTime: convertTo24Hour(rideScheduledTime)
		}

		setPickUpAddress(pickUpAddress)
		setDropOffAddress(dropOffAddress)

		fetchPriceListFromCarmel({ hotelId: hotelId, rideList: priceListPayload })
	}

	return (
		<form>
			<View className='m-[12] gap-[12]'>
				<Controller
					control={control}
					name='airport'
					key={'airport'}
					rules={{ required: 'Airport is required' }}
					render={({ field: { value, onChange } }) => (
						<CustomElementDropdown
							label='Airport'
							value={value}
							setValue={onChange}
							options={[
								{
									value: 'JFK',
									label: 'John F. Kennedy International Airport (JFK)'
								},
								{ value: 'LGA', label: 'LaGuardia Airport (LGA)' },
								{
									value: 'EWR',
									label: 'Newark Liberty International Airport (EWR)'
								}
							]}
						/>
					)}
				/>

				<Controller
					control={control}
					key={'travelDate'}
					name='travelDate'
					rules={{ required: 'Travel Date is required' }}
					render={({ field: { value, onChange } }) => (
						<CustomDatePicker
							label={'Travel Date'}
							value={value}
							setValue={value => {
								onChange(value)
								setRideScheduledTime('')
								setValue('travelTime', '')
							}}
						/>
					)}
				/>
				<Controller
					control={control}
					name='travelTime'
					key={'travelTime'}
					rules={{ required: 'Travel Time is required' }}
					render={({ field: { value, onChange } }) => (
						<CustomElementDropdown
							label='Travel Time'
							value={rideScheduledTime}
							setValue={value => {
								setRideScheduledTime(value || '')
								onChange(value)
							}}
							options={timeOptions.map(time => ({ value: time, label: time }))}
							disabled={!formValues.travelDate}
						/>
					)}
				/>
			</View>
			<View className='px-[20] pt-[8] pb-[10]'>
				<LoadingButton
					isLoading={isPending}
					disabled={!isValid}
					className={`rounded-full w-full h-[54] flex items-center justify-center ${
						isValid ? 'bg-primary-950' : `bg-tabInactiveColor-500`
					}`}
					onPress={() => {
						removeRide()
						const rideScheduledDate = handleRideTime(
							formValues?.travelDate,
							rideScheduledTime
						)
						if (
							currentHotelDetails?.timezone &&
							!validateScheduleRideTime(
								rideScheduledDate,
								currentHotelDetails?.timezone
							)
						) {
							setSnackbarMessage(
								true,
								SnackbarType.ERROR,
								'Unable to book ride',
								'Please schedule the ride at least 15 minutes ahead'
							)
							setValue('travelDate', rideForm.travelDate)
							setValue('travelTime', rideForm.travelTime)
							setRideScheduledTime(rideForm.travelTime)
						} else {
							handleFindRideSubmit(rideScheduledDate)
						}
					}}
				>
					<Text variant='p2Medium' className='font-extrabold text-white'>
						{isValid ? `Find Rides` : `Make Required Selections`}
					</Text>
				</LoadingButton>
			</View>
			<View className='bg-utility-green50 m-6 py-[12.5] px-[24] gap-[5]'>
				<View className='flex-row gap-[5] items-center '>
					<Ionicons
						name='checkmark'
						size={24}
						className='text-utility-green500'
					/>
					<Text
						variant='p2Medium'
						className='text-utility-green500'
					>{`Premium Cars at affordable rates`}</Text>
				</View>
				<View className='flex-row gap-[5] items-center '>
					<Ionicons
						name='checkmark'
						size={24}
						className='text-utility-green500'
					/>
					<Text
						variant='p2Medium'
						className='text-utility-green500'
					>{`All-inclusive pricing includes Tips & Fees`}</Text>
				</View>
			</View>
		</form>
	)
}

export default RideFormContainer
