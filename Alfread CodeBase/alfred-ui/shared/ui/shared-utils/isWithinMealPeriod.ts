import { isAfter, isBefore, subDays, startOfDay, endOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

export function isWithinMealPeriod(
  mealPeriodStartTime: Date,
  mealPeriodEndTime: Date,
  isLateNightMeal: boolean
): boolean {
  const timezone = "America/New_York";

  // Convert the current time to EDT
  const currentTimeInEDT = utcToZonedTime(new Date(), timezone);

  if (isLateNightMeal) {
    // Adjust mealPeriodEndTime for late-night period
    const lateNightMealPeriodEnd = subDays(mealPeriodEndTime, 1);

    // Check if within late-night boundaries
    if (
      (isAfter(currentTimeInEDT, mealPeriodStartTime) && isBefore(currentTimeInEDT, endOfDay(currentTimeInEDT))) ||
      (isAfter(currentTimeInEDT, startOfDay(currentTimeInEDT)) && isBefore(currentTimeInEDT, lateNightMealPeriodEnd))
    ) {
      return true;
    }
  }

  return isAfter(currentTimeInEDT, mealPeriodStartTime) && isBefore(currentTimeInEDT, mealPeriodEndTime);
}
