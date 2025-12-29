import {
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { DEFAULT_SYSTEM_TIMEZONE } from "helpers";

export function isWithinMealPeriod(
  mealPeriodStartTime: Date,
  mealPeriodEndTime: Date,
  scheduledStartTime: Date,
  scheduledEndTime: Date,
  isLateNightMeal: boolean
): boolean {
  if (isLateNightMeal) {
    const mealPeriodEndAtMidnight = endOfDay(mealPeriodStartTime);

    return (
      isWithinInterval(scheduledStartTime, {
        start: mealPeriodStartTime,
        end: mealPeriodEndAtMidnight,
      }) ||
      isWithinInterval(scheduledEndTime, {
        start: subDays(startOfDay(mealPeriodEndTime), 1),
        end: subDays(mealPeriodEndTime, 1),
      })
    );
  }
  return (
    isWithinInterval(scheduledStartTime, {
      start: mealPeriodStartTime,
      end: mealPeriodEndTime,
    }) ||
    isWithinInterval(scheduledEndTime, {
      start: mealPeriodStartTime,
      end: mealPeriodEndTime,
    })
  );
}
