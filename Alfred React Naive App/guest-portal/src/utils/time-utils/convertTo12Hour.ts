export const convertTo12Hour = (input: Date | string | null): string => {
	if (input === null) return ''

	let hours: number
	let minutes: string
	let period: string

	if (input instanceof Date) {
		hours = input.getHours()
		minutes = String(input.getMinutes()).padStart(2, '0')
		period = hours >= 12 ? 'PM' : 'AM'

		hours = hours % 12 || 12
	} else if (typeof input === 'string') {
		const [hourString, minuteString] = input.split(':')
		hours = Number.parseInt(hourString)
		minutes = minuteString
		period = 'AM'

		if (hours === 0) {
			hours = 12
		} else if (hours === 12) {
			period = 'PM'
		} else if (hours > 12) {
			hours -= 12
			period = 'PM'
		}
	} else {
		return ''
	}

	return `${hours}:${minutes} ${period}`
}
