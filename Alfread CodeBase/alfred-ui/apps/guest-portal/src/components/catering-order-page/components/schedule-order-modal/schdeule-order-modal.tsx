import {
	StyledButton,
	StyledDatePicker,
	StyledModal,
	StyledSelect
} from "@/design-components"
import React, { useState } from "react"
import { Flex } from "@mantine/core"
import { isBefore } from "date-fns"
import { map, range, isNumber } from "lodash"
import {
	createDateFromStringInTimezone,
	customNotification,
	formatDate,
	getMealPeriodWorkingHours,
	getTimezoneAbbreviation,
	validateScheduleOrderTime
} from "@/shared-utils"
import { cartActionTypes } from "@/components/order-page/reducers/cartReducerts"
import { isMobileOnly } from "react-device-detect"

const getPeriodHour = (hour: number) => {
	const period = hour >= 12 ? "PM" : "AM"

	hour = hour % 12
	hour = hour || 12

	return `${hour} ${period}`
}

const ScheduleOrderModal = ({
	cartState,
	dispatchCart,
	mealPeriodStartHour,
	mealPeriodEndHour,
	scheduleOrderModalOpen,
	setScheduleOrderModalOpen
}: any) => {
	const [scheduledDate, setScheduledDate] = useState<any>(null)
	const [scheduledHour, setScheduledHour] = useState(null)
	const [scheduledMinute, setScheduledMinute] = useState(null)

	let startHour = null
	let endHour = null
	let startMinute = 0
	let endMinute = 59

	const handleScheduledDateChange = (value: any) => {
		setScheduledDate(value)
		setScheduledHour(null)
		setScheduledMinute(null)
	}

	if (mealPeriodStartHour && mealPeriodEndHour) {
		const { mealPeriodStartTime, mealPeriodEndTime } =
			getMealPeriodWorkingHours({
				timezone: cartState?.currentHotel?.timezone,
				startHour: mealPeriodStartHour,
				endHour: mealPeriodEndHour
			})
		startHour = mealPeriodStartTime?.getHours()
		endHour = mealPeriodEndTime?.getHours()

		if (scheduledHour === mealPeriodStartTime?.getHours()) {
			startMinute = mealPeriodStartTime?.getMinutes()
			endMinute = 59
		} else if (scheduledHour === mealPeriodEndTime?.getHours()) {
			startMinute = 0
			endMinute = mealPeriodEndTime?.getMinutes()
		}
	}
	const hourOptions = map(range(startHour || 0, (endHour || 0) + 1), hour => ({
		value: hour,
		label: `${getPeriodHour(hour)}`
	}))
	const minuteOptions = map(
		range(startMinute || 0, (endMinute || 0) + 1),
		minute => ({
			value: minute,
			label: `${minute}`
		})
	)

	const onClose = () => {
		setScheduleOrderModalOpen(false)
		setScheduledDate(null)
		setScheduledHour(null)
		setScheduledMinute(null)
	}

	const timezone = getTimezoneAbbreviation(cartState?.currentHotel?.timezone)

	return (
		<StyledModal
			size='md'
			centered={true}
			opened={scheduleOrderModalOpen}
			onClose={onClose}
			title={`Select order date & time (${timezone})`}
			modalBody={
				<Flex direction='column' justify='center' mih={400} rowGap={24}>
					<StyledDatePicker
						size={isMobileOnly ? "sm" : "lg"}
						m='auto'
						value={scheduledDate}
						onChange={(value: any) => handleScheduledDateChange(value)}
						excludeDate={(date: Date) => {
							return isBefore(date, new Date())
						}}
					/>
					<Flex columnGap={16} justify='center'>
						<StyledSelect
							label='Hour'
							searchable
							size='md'
							min={0}
							max={12}
							data={hourOptions}
							value={scheduledHour}
							onChange={(value: any) => {
								setScheduledHour(value)
								setScheduledMinute(null)
							}}
						/>
						<StyledSelect
							min={0}
							max={59}
							size='md'
							searchable
							label='Minutes'
							data={minuteOptions}
							value={scheduledMinute}
							disabled={!isNumber(scheduledHour)}
							onChange={(value: any) => {
								setScheduledMinute(value)
							}}
						/>
					</Flex>
				</Flex>
			}
			modalFooter={
				<Flex justify='flex-end' columnGap={16}>
					<StyledButton variant='outline' color='dark' onClick={onClose}>
						Cancel
					</StyledButton>
					<StyledButton
						color='green'
						disabled={
							!scheduledDate ||
							!isNumber(scheduledHour) ||
							!isNumber(scheduledMinute)
						}
						onClick={() => {
							if (
								scheduledDate &&
								isNumber(scheduledHour) &&
								isNumber(scheduledMinute)
							) {
								const scheduledDateWithTimezone =
									createDateFromStringInTimezone({
										dateObj: { hour: scheduledHour, minute: scheduledMinute },
										dateString: formatDate(
											scheduledDate,
											"yyyy-MM-dd HH:mm:ss"
										),
										timezone: cartState?.currentHotel?.timezone
									})
								if (
									!validateScheduleOrderTime(scheduledDateWithTimezone, true)
								) {
									customNotification.error({
										title: "Schedule Order Failed",
										message:
											"Your scheduled order time is too soon. Please reschedule to a time at least 8 hours from now."
									})
									setScheduledDate(null)
									setScheduledHour(null)
									setScheduledMinute(null)
								} else {
									dispatchCart({
										type: cartActionTypes.SET_SCHEDULED_ORDER_DATE,
										scheduledDate: scheduledDateWithTimezone
									})
									onClose()
								}
							}
						}}
					>
						Schedule
					</StyledButton>
				</Flex>
			}
		/>
	)
}

export default ScheduleOrderModal
