import React, { useState, useEffect } from 'react'
import {
	View,
	Modal,
	ScrollView,
	Pressable,
	ActivityIndicator
} from 'react-native'
import { Text } from '@components/ui/text'
import { CloseIcon } from '@components/ui/icons/CloseIcon'
import {
	format,
	addDays,
	setHours,
	setMinutes,
	isAfter,
	startOfDay,
	isSameDay,
	isToday,
	isBefore,
	subDays,
	addMinutes
} from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { useGlobalStore } from '@/src/store/useGlobalStore'
import { useCartStore } from '@/src/store/useCartStore'
import { LeftActiveTabIcon } from '../ui/icons/LeftActiveTabIcon'
import { RightActiveTabIcon } from '../ui/icons/RightActiveTabIcon'
import { RightInactiveTabIcon } from '../ui/icons/RightInactiveTabIcon'
import { LeftInactiveTabIcon } from '../ui/icons/LeftInactiveTabIcon'
import { useSnackbarStore } from '@/src/store/useSnackbarStore'
import { SnackbarType } from '@/src/types/others'
import useFetchMenuDetails from '@/src/hooks/useFetchMenuDetails'
import { validateCartItems } from '@/src/utils/validation-utils/validateCartItems'

interface SchedulerModalProperties {
	visible: boolean
	onClose: () => void
	onLoadingChange?: (loading: boolean) => void
}

const SchedulerModal: React.FC<SchedulerModalProperties> = ({
	visible,
	onClose,
	onLoadingChange
}) => {
	const { currentHotelDetails, selectedMerchantId, refetchMenuItems } =
		useGlobalStore()
	const { setSnackbarMessage } = useSnackbarStore()
	const { setOrderScheduledDate, order, setMenuItems, setOrderItems } =
		useCartStore()
	const [selectedDate, setSelectedDate] = useState<Date>(new Date())
	const [selectedTime, setSelectedTime] = useState<Date | 'ASAP' | null>('ASAP')
	const [timeSlots, setTimeSlots] = useState<Date[]>([])
	const timezone = currentHotelDetails?.timezone || 'America/New_York'

	const { mutate: fetchMenuDetails, isPending } = useFetchMenuDetails({
		onSuccess: (result: any) => {
			setMenuItems(result)
			if (onLoadingChange) {
				onLoadingChange(false)
			}
			if (order?.items?.length > 0) {
				const orderItems = validateCartItems(order?.items, result)
				setOrderItems(orderItems)
			}
			onClose()
		},
		onError: () => {
			setSnackbarMessage(
				true,
				SnackbarType.ERROR,
				'Failure',
				'Unable to find any menu'
			)
			if (onLoadingChange) {
				onLoadingChange(false)
			}
			onClose()
		}
	})

	useEffect(() => {
		if (isPending && onLoadingChange) {
			onLoadingChange(true)
		}
	}, [isPending, onLoadingChange])

	const generateTimeSlots = (date: Date): Date[] => {
		const slots: Date[] = []
		const currentDate = new Date()
		let startTime = isSameDay(date, currentDate)
			? currentDate
			: setMinutes(setHours(startOfDay(date), 0), 0)

		if (isSameDay(date, currentDate)) {
			const minutes = currentDate.getMinutes()
			startTime = setMinutes(currentDate, Math.ceil(minutes / 30) * 30)
		}

		const endTime = setMinutes(setHours(date, 23), 30)
		let currentSlot = startTime

		while (isAfter(endTime, currentSlot)) {
			slots.push(new Date(currentSlot))
			currentSlot = new Date(currentSlot.getTime() + 30 * 60_000)
		}

		return slots
	}

	useEffect(() => {
		setTimeSlots(generateTimeSlots(selectedDate))
	}, [selectedDate])

	useEffect(() => {
		if (order.scheduledDate) {
			if (order.scheduledDate === 'ASAP') {
				setSelectedTime('ASAP')
				setSelectedDate(new Date())
			} else {
				const dateObject = new Date(order.scheduledDate)
				setSelectedTime(dateObject)
				setSelectedDate(dateObject)
			}
		}
	}, [visible, order.scheduledDate])

	const handleTimeSelection = (time: Date | 'ASAP'): void => {
		setSelectedTime(time)
	}

	const handleSchedule = (): void => {
		if (!selectedTime) return

		if (
			typeof selectedTime !== 'string' &&
			isBefore(selectedTime, new Date())
		) {
			setSnackbarMessage(
				true,
				SnackbarType.ERROR,
				'Invalid Time',
				'Please select a future time'
			)
			return
		}
		setOrderScheduledDate(selectedTime === 'ASAP' ? 'ASAP' : selectedTime)

		if (refetchMenuItems && currentHotelDetails && selectedMerchantId) {
			const now = new Date()

			if (selectedTime === 'ASAP') {
				const currentTime = formatInTimeZone(now, timezone, 'HH:mm')
				const payload = {
					scheduledDate: formatInTimeZone(now, timezone, 'MM/dd/yyyy'),
					scheduledStartTime: currentTime,
					scheduledEndTime: currentTime
				}

				fetchMenuDetails({
					hotelId: currentHotelDetails.id.toString(),
					merchantId: selectedMerchantId.toString(),
					fetchMenuPayload: payload
				})
			} else {
				const scheduledDate = formatInTimeZone(
					selectedTime,
					timezone,
					'MM/dd/yyyy'
				)
				const startTime = formatInTimeZone(selectedTime, timezone, 'HH:mm')
				const endTime = formatInTimeZone(
					addMinutes(selectedTime, 30),
					timezone,
					'HH:mm'
				)

				const payload = {
					scheduledDate,
					scheduledStartTime: startTime,
					scheduledEndTime: endTime
				}

				fetchMenuDetails({
					hotelId: currentHotelDetails.id.toString(),
					merchantId: selectedMerchantId.toString(),
					fetchMenuPayload: payload
				})
			}
		} else {
			onClose()
		}
	}

	const handlePreviousDay = (): void => {
		const previousDate = subDays(selectedDate, 1)
		if (!isBefore(previousDate, startOfDay(new Date()))) {
			setSelectedDate(previousDate)
		}
	}

	const handleNextDay = (): void => {
		const nextDate = addDays(selectedDate, 1)
		if (isBefore(nextDate, addDays(new Date(), 14))) {
			setSelectedDate(nextDate)
		}
	}

	const canGoPrevious = !isBefore(
		subDays(selectedDate, 1),
		startOfDay(new Date())
	)
	const canGoNext = isBefore(addDays(selectedDate, 1), addDays(new Date(), 14))

	return (
		<Modal
			animationType='none'
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View className='flex-1 bg-black/50 justify-center items-center px-6'>
				<View className='w-full max-w-[353px] bg-white rounded-2xl overflow-hidden'>
					<View className='flex-row justify-between items-center px-6 py-[14] bg-gray-300'>
						<View className='w-8' />
						<Text variant='p1' className='text-gray-800 flex-1 text-center'>
							{`Schedule Your Delivery`}
						</Text>
						<Pressable onPress={onClose} className='items-end'>
							<CloseIcon />
						</Pressable>
					</View>

					<View className='px-6 py-4'>
						<View className='flex-row justify-center items-center space-x-12'>
							<Pressable onPress={handlePreviousDay}>
								{canGoPrevious ? (
									<LeftActiveTabIcon />
								) : (
									<LeftInactiveTabIcon />
								)}
							</Pressable>
							<View className='items-center'>
								<Text variant='h1' className='text-blue-700'>
									{isToday(selectedDate)
										? 'Today'
										: format(selectedDate, 'EEEE')}
								</Text>
								<Text variant='p2Medium' className='text-blue-700'>
									{format(selectedDate, 'MMMM d')}
								</Text>
							</View>
							<Pressable onPress={handleNextDay}>
								{canGoNext ? <RightActiveTabIcon /> : <RightInactiveTabIcon />}
							</Pressable>
						</View>
					</View>

					<ScrollView className='max-h-[400px] py-[16] bg-gray-300'>
						{isToday(selectedDate) && (
							<Pressable
								onPress={() => handleTimeSelection('ASAP')}
								className={`mx-4 mb-2 rounded-lg ${
									selectedTime === 'ASAP'
										? 'bg-blue-300 border border-blue-500'
										: 'bg-primary-foreground'
								}`}
							>
								<View className='py-[8]'>
									<Text variant='p2Heavy' className='text-center text-blue-500'>
										{`ASAP`}
									</Text>
								</View>
							</Pressable>
						)}
						{timeSlots.map(time => (
							<Pressable
								key={time.toISOString()}
								onPress={() => handleTimeSelection(time)}
								className={`mx-4 mb-2 rounded-lg ${
									selectedTime === time
										? 'bg-blue-300 border border-blue-500'
										: 'bg-primary-foreground'
								}`}
							>
								<View className='py-[8]'>
									<Text
										variant='p2Medium'
										className='text-center text-blue-500'
									>
										{formatInTimeZone(time, timezone, 'h:mm')} -{' '}
										{formatInTimeZone(
											new Date(time.getTime() + 30 * 60_000),
											timezone,
											'h:mm a'
										)}
									</Text>
								</View>
							</Pressable>
						))}
					</ScrollView>

					<View className='flex-row justify-between py-[12] px-[12]'>
						<Pressable onPress={onClose} className='px-6 py-3'>
							<Text variant='h4' className='text-blue-500'>{`Cancel`}</Text>
						</Pressable>
						<Pressable
							onPress={handleSchedule}
							className='px-[60] py-[10] bg-blue-700 rounded-full'
							disabled={isPending}
						>
							{isPending ? (
								<ActivityIndicator size='small' color='white' />
							) : (
								<Text variant='h5' className='text-white'>{`Schedule`}</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	)
}

export default SchedulerModal
