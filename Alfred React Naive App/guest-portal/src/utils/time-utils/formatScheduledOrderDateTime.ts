import { formatInTimeZone } from 'date-fns-tz'

const formatScheduledOrderDateTime = (
	scheduledDate: string | Date,
	timezone: string
): string | null => {
	const selectedDate = new Date(scheduledDate)

	if (Number.isNaN(selectedDate.getTime())) {
		return null
	}

	const formattedDate = formatInTimeZone(
		selectedDate,
		timezone,
		'yyyy-MM-dd HH:mm:ss.SSS XXX'
	)

	return formattedDate
}

export default formatScheduledOrderDateTime
