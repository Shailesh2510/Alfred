import { StyledButton, StyledModal } from "@/design-components"
import React, { useEffect, useState } from "react"
import { Flex } from "@mantine/core"
import {
	addMinutes,
	isAfter,
	isSameDay,
	parse,
	setMinutes,
	setSeconds,
	isBefore,
	startOfDay,
	isSameMinute,
	endOfDay
} from "date-fns"
import getTimezoneAbbreviation from "../../../../../../../../shared/ui/shared-utils/getTimezoneAbbreviation"
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz"
import getMealPeriodWorkingHours from "../../../../../../../../shared/ui/shared-utils/getMealPeriodWorkingHours"
import DatesContainer from "./dates-container/dates-container"
import dayjs, { Dayjs } from "dayjs"
import useGlobalStore from "@/globalStore/globalStore"
import useCartStore from "@/components/order-page/stores/useCartStore"
import { convertTo12Hour } from "@/shared-utils"

const ScheduleOrderModalNew: React.FC<any> = ({
	mealPeriodStartHour,
	mealPeriodEndHour,
	scheduleOrderModalOpen,
	setScheduleOrderModalOpen,
	isSmallScreen
}) => {
	const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
	const [timeOptions, setTimeOptions] = useState<string[]>([])
	const [selectedTime, setSelectedTime] = useState<string | undefined>()

	const { currentHotelDetails } = useGlobalStore()

	const {
		setScheduledOrderDate,
		setShowCartModal,
		showCartModalOnScheduleModalClose,
		setShowCartModalOnScheduleModalClose
	} = useCartStore()

	const timezone = getTimezoneAbbreviation(currentHotelDetails?.timezone)

	const generateTimeOptions = (selectedDate: Dayjs) => {
		const currentZonedDate = utcToZonedTime(
			new Date(),
			currentHotelDetails?.timezone
		)

		const { mealPeriodStartTime, mealPeriodEndTime, isLateNightMeal } =
			getMealPeriodWorkingHours({
				timezone: currentHotelDetails?.timezone,
				startHour: mealPeriodStartHour,
				endHour: mealPeriodEndHour
			})

		let start: Date
		let end: Date

		if (isLateNightMeal) {
			if (isSameDay(selectedDate.toDate(), currentZonedDate)) {
				const availableTimeSlots: string[] = []

				const generateSlots = (slotStart: Date, slotEnd: Date) => {
					let currentSlot = slotStart
					const endSlot = slotEnd

					const minutes = currentSlot.getMinutes()
					if (minutes % 15 !== 0) {
						currentSlot = setMinutes(currentSlot, Math.ceil(minutes / 15) * 15)
						currentSlot = setSeconds(currentSlot, 0)
					}

					while (
						isBefore(currentSlot, endSlot) ||
						isSameMinute(currentSlot, endSlot)
					) {
						const nextSlot = addMinutes(currentSlot, 15)
						const isValidSlot =
							isBefore(nextSlot, endSlot) || isSameMinute(nextSlot, endSlot)

						if (isValidSlot) {
							const timeLabel = `${convertTo12Hour(
								currentSlot
							)} - ${convertTo12Hour(nextSlot)}`
							availableTimeSlots.push(timeLabel)
						}

						currentSlot = nextSlot
					}
				}

				const earlyStart = addMinutes(currentZonedDate, 60)
				const earlyEnd = new Date(selectedDate.toDate())
				earlyEnd.setHours(
					parseInt(mealPeriodEndHour.split(":")[0]),
					parseInt(mealPeriodEndHour.split(":")[1]),
					0,
					0
				)

				const lateStart = new Date(selectedDate.toDate())
				lateStart.setHours(
					parseInt(mealPeriodStartHour.split(":")[0]),
					parseInt(mealPeriodStartHour.split(":")[1]),
					0,
					0
				)
				const lateEnd = endOfDay(selectedDate.toDate())

				if (isBefore(earlyStart, earlyEnd)) {
					generateSlots(earlyStart, earlyEnd)
				}

				if (
					isBefore(lateStart, lateEnd) &&
					isAfter(lateStart, currentZonedDate)
				) {
					generateSlots(lateStart, lateEnd)
				}

				setTimeOptions(availableTimeSlots)
				return
			} else {
				const earlyStart = isBefore(
					addMinutes(currentZonedDate, 60),
					startOfDay(selectedDate.toDate())
				)
					? startOfDay(selectedDate.toDate())
					: addMinutes(currentZonedDate, 60)
				const earlyEnd = new Date(
					selectedDate
						.toDate()
						.setHours(
							parseInt(mealPeriodEndHour.split(":")[0]),
							parseInt(mealPeriodEndHour.split(":")[1]),
							0,
							0
						)
				)

				const lateStart = new Date(
					selectedDate
						.toDate()
						.setHours(
							parseInt(mealPeriodStartHour.split(":")[0]),
							parseInt(mealPeriodStartHour.split(":")[1]),
							0,
							0
						)
				)

				const lateEnd = endOfDay(selectedDate.toDate())

				const availableTimeSlots: string[] = []

				const generateSlots = (slotStart: Date, slotEnd: Date) => {
					let currentSlot = slotStart
					const endSlot = slotEnd

					const minutes = currentSlot.getMinutes()
					if (minutes % 15 !== 0) {
						currentSlot = setMinutes(currentSlot, Math.ceil(minutes / 15) * 15)
						currentSlot = setSeconds(currentSlot, 0)
					}

					while (
						isBefore(currentSlot, endSlot) ||
						isSameMinute(currentSlot, endSlot)
					) {
						const nextSlot = addMinutes(currentSlot, 15)
						const isValidSlot =
							isBefore(nextSlot, endSlot) || isSameMinute(nextSlot, endSlot)

						if (isValidSlot) {
							const timeLabel = `${convertTo12Hour(
								currentSlot
							)} - ${convertTo12Hour(nextSlot)}`
							availableTimeSlots.push(timeLabel)
						}

						currentSlot = nextSlot
					}
				}

				generateSlots(earlyStart, earlyEnd)
				generateSlots(lateStart, lateEnd)

				setTimeOptions(availableTimeSlots)
				return
			}
		} else {
			start = isSameDay(selectedDate.toDate(), currentZonedDate)
				? isAfter(currentZonedDate, mealPeriodStartTime)
					? addMinutes(currentZonedDate, 60)
					: mealPeriodStartTime
				: new Date(selectedDate.toDate())
			start.setHours(
				parseInt(mealPeriodStartHour.split(":")[0]),
				parseInt(mealPeriodStartHour.split(":")[1]),
				0,
				0
			)

			end = isSameDay(selectedDate.toDate(), currentZonedDate)
				? mealPeriodEndTime
				: new Date(selectedDate.toDate())
			end.setHours(
				parseInt(mealPeriodEndHour.split(":")[0]),
				parseInt(mealPeriodEndHour.split(":")[1]),
				0,
				0
			)
		}

		const availableTimeSlots = []
		let currentSlot = start

		while (isBefore(currentSlot, end) || isSameMinute(currentSlot, end)) {
			const nextSlot = addMinutes(currentSlot, 15)

			const isValidSlot = isBefore(nextSlot, end) || isSameMinute(nextSlot, end)
			const isFutureSlot = isSameDay(selectedDate.toDate(), currentZonedDate)
				? isAfter(nextSlot, addMinutes(currentZonedDate, 60))
				: true

			if (isValidSlot && isFutureSlot) {
				const timeLabel = `${convertTo12Hour(currentSlot)} - ${convertTo12Hour(
					nextSlot
				)}`
				availableTimeSlots.push(timeLabel)
			}

			currentSlot = nextSlot
		}

		setTimeOptions(availableTimeSlots)
	}

	useEffect(() => {
		if (selectedDate) {
			generateTimeOptions(selectedDate)
		}
	}, [selectedDate, mealPeriodStartHour, mealPeriodEndHour])

	const onClose = () => {
		setScheduleOrderModalOpen(false)
		setSelectedDate(null)
		setTimeOptions([])
		if (showCartModalOnScheduleModalClose && isSmallScreen) {
			setShowCartModal(true)
			setShowCartModalOnScheduleModalClose(false)
		}
	}

	useEffect(() => {
		if (scheduleOrderModalOpen) {
			setSelectedDate(dayjs())
		}
	}, [scheduleOrderModalOpen])

	const handleScheduleOrder = (selectedDate: any, selectedTime: string) => {
		const dateObj = new Date(selectedDate.toDate())
		const timezone = currentHotelDetails?.timezone

		const zonedDate = utcToZonedTime(dateObj, timezone)

		const [startTime] = selectedTime.split(" - ")

		const parsedTime = parse(startTime, "hh:mm a", zonedDate)

		const formattedDateTime = formatInTimeZone(
			parsedTime,
			timezone,
			"MM/dd/yyyy hh:mm a (zzz)"
		)

		setScheduledOrderDate(formattedDateTime)
		onClose()
	}

	return (
		<StyledModal
			size='md'
			centered={true}
			opened={scheduleOrderModalOpen}
			onClose={onClose}
			title={`Select order date & time (${timezone})`}
			modalBody={
				<DatesContainer
					selectedDate={selectedDate}
					setSelectedDate={setSelectedDate}
					timeOptions={timeOptions}
					isSmallScreen={isSmallScreen}
					selectedTime={selectedTime}
					setSelectedTime={setSelectedTime}
				/>
			}
			modalFooter={
				<Flex justify='flex-end' columnGap={16}>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						disabled={!selectedDate || !selectedTime}
						onClick={() => {
							handleScheduleOrder(selectedDate, selectedTime!)
						}}
					>
						Schedule
					</StyledButton>
				</Flex>
			}
		/>
	)
}
export default ScheduleOrderModalNew
