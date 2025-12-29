import { SCHEDULE_ORDER_DIFFERENCE_TIME_IN_MINUTES } from '../constants'

export function validateScheduleOrderTime(
	dateToCheck: Date | string | null
): boolean {
	if (!dateToCheck) {
		return false
	}

	const date =
		typeof dateToCheck === 'string' ? new Date(dateToCheck) : dateToCheck

	if (Number.isNaN(date.getTime())) {
		return false
	}

	const now = new Date()
	const timeDifference = date.getTime() - now.getTime()
	const differenceInMinutes = timeDifference / (1000 * 60)

	return differenceInMinutes >= SCHEDULE_ORDER_DIFFERENCE_TIME_IN_MINUTES
}
