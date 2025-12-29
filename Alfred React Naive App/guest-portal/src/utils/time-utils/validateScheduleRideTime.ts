import { toZonedTime } from 'date-fns-tz'
import { RIDE_DIFFERENCE_TIME_IN_MINUTES } from '../constants'

export function validateScheduleRideTime(
	dateToCheck: string | null,
	timezone: string
): boolean {
	if (!dateToCheck) {
		return true
	}

	const date =
		typeof dateToCheck === 'string' ? new Date(dateToCheck) : dateToCheck

	if (Number.isNaN(date.getTime())) {
		return false
	}

	const now = toZonedTime(new Date(), timezone)
	const timeDifference = date.getTime() - now.getTime()
	const differenceInMinutes = timeDifference / (1000 * 60)

	return differenceInMinutes >= RIDE_DIFFERENCE_TIME_IN_MINUTES
}
