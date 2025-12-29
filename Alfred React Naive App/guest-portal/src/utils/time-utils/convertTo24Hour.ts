export const convertTo24Hour = (time12h: string): string => {
	const [time, period] = time12h.split(' ')
	const [hours, minutes] = time.split(':')
	let hoursNumber = Number.parseInt(hours)

	if (period === 'PM' && hoursNumber !== 12) {
		hoursNumber += 12
	} else if (period === 'AM' && hoursNumber === 12) {
		hoursNumber = 0
	}

	return `${hoursNumber.toString().padStart(2, '0')}:${minutes}`
}
