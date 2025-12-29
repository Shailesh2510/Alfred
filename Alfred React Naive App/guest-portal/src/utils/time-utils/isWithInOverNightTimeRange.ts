import { isAfter, isBefore } from 'date-fns'
export function isWithInOverNightTimeRange(): boolean {
	const currentTime = Date.now()
	const startTime = new Date().setHours(22, 15, 0)
	const endTime = new Date().setHours(7, 0, 0)

	const isWithInOverNightTimeRange =
		isAfter(currentTime, startTime) || isBefore(currentTime, endTime)

	return isWithInOverNightTimeRange
}
