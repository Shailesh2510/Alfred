import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";
import { addDays, isBefore } from "date-fns";
import createDateFromHourStringInTimezone from "./createDateFromHourStringInTimezone";

const getMealPeriodWorkingHours = ({
  startHour,
  endHour,
  timezone,
  timeFormat = "hh:mm aa zzz",
}: {
  startHour: string;
  endHour: string;
  timezone: string;
  timeFormat?: string;
}) => {
  const now = utcToZonedTime(new Date(), timezone);
  let mealPeriodStartTime = createDateFromHourStringInTimezone(startHour, timezone);
  let mealPeriodEndTime = createDateFromHourStringInTimezone(endHour, timezone);

  // Check if it's a late night meal (end time is before start time)
  const isLateNightMeal = isBefore(mealPeriodEndTime, mealPeriodStartTime);

  if (isLateNightMeal) {
    // If the end time is before the start time, it means the meal period extends to the next day
    mealPeriodEndTime = addDays(mealPeriodEndTime, 1);
  }

  const mealPeriodStartTimeString = formatInTimeZone(mealPeriodStartTime, timezone, timeFormat);
  const mealPeriodEndTimeString = formatInTimeZone(mealPeriodEndTime, timezone, timeFormat);

  return {
    mealPeriodStartTime,
    mealPeriodStartTimeString,
    mealPeriodEndTime,
    mealPeriodEndTimeString,
    isLateNightMeal,
  };
};

export default getMealPeriodWorkingHours;
