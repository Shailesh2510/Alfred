import { formatInTimeZone } from "date-fns-tz"

interface MealPeriod {
	startHour: string
	endHour: string
	mealPeriodId: number
}

const validateCartItems = (
	mealPeriods: MealPeriod[],
	currentTime: Date = new Date(),
	timezone: string
): boolean => {
	if (mealPeriods.length === 0) {
		return true
	}

	const currentTimeInZone = formatInTimeZone(currentTime, timezone, "HH:mm")
	const [currentHour, currentMinutes] = currentTimeInZone.split(":").map(Number)
	const currentTimeInMinutes = currentHour * 60 + currentMinutes

	for (const mealPeriod of mealPeriods) {
		const [startHour, startMinutes] = mealPeriod.startHour
			.split(":")
			.map(Number)
		const [endHour, endMinutes] = mealPeriod.endHour.split(":").map(Number)

		const startTimeInMinutes = startHour * 60 + startMinutes
		const endTimeInMinutes = endHour * 60 + endMinutes

		let isWithinPeriod = false

		if (endTimeInMinutes < startTimeInMinutes) {
			isWithinPeriod =
				currentTimeInMinutes >= startTimeInMinutes ||
				currentTimeInMinutes <= endTimeInMinutes
		} else {
			isWithinPeriod =
				currentTimeInMinutes >= startTimeInMinutes &&
				currentTimeInMinutes <= endTimeInMinutes
		}

		if (!isWithinPeriod) {
			return false
		}
	}
	return true
}

export default validateCartItems
