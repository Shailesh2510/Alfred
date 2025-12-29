import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { addDays, isBefore } from "date-fns";
import createDateFromHourStringInTimezone from "./createDateFromHourStringInTimezone";

const getMealPeriodWorkingHours = ({
  startHour,
  endHour,
  timezone,
  scheduledStartHour,
  scheduledEndHour,
}: {
  startHour: string;
  endHour: string;
  timezone: string;
  timeFormat?: string;
  scheduledStartHour?: string;
  scheduledEndHour?: string;
}) => {
  let mealPeriodStartTime = createDateFromHourStringInTimezone(
    startHour,
    timezone
  );
  let mealPeriodEndTime = createDateFromHourStringInTimezone(endHour, timezone);

  let scheduledStartTime = createDateFromHourStringInTimezone(
    scheduledStartHour,
    timezone
  );
  let scheduledEndTime = createDateFromHourStringInTimezone(
    scheduledEndHour,
    timezone
  );

  // Check if it's a late night meal (end time is before start time)
  const isLateNightMeal = isBefore(mealPeriodEndTime, mealPeriodStartTime);

  if (isLateNightMeal) {
    // If the end time is before the start time, it means the meal period extends to the next day
    mealPeriodEndTime = addDays(mealPeriodEndTime, 1);
  }

  return {
    mealPeriodStartTime: toZonedTime(mealPeriodStartTime, timezone),
    mealPeriodEndTime: toZonedTime(mealPeriodEndTime, timezone),
    scheduledStartTime: toZonedTime(scheduledStartTime, timezone),
    scheduledEndTime: toZonedTime(scheduledEndTime, timezone),
    isLateNightMeal,
  };
};

export default getMealPeriodWorkingHours;
