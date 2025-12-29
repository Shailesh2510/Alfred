import {
  CATERING_ORDER_DIFFERENCE_TIME_IN_MINUTES,
  SCHEDULE_ORDER_DIFFERENCE_TIME_IN_MINUTES,
} from "../shared-constants";

export function validateScheduleOrderTime(dateToCheck: Date | string | null, isCateringOrder = false): boolean {
  if (!dateToCheck) {
    // Return true for a non-catering order with no date, and false for catering orders without a date.
    return !isCateringOrder;
  }

  const date = typeof dateToCheck === "string" ? new Date(dateToCheck) : dateToCheck;

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const timeDifference = date.getTime() - now.getTime();
  const differenceInMinutes = timeDifference / (1000 * 60);

  const requiredDifference = isCateringOrder
    ? CATERING_ORDER_DIFFERENCE_TIME_IN_MINUTES
    : SCHEDULE_ORDER_DIFFERENCE_TIME_IN_MINUTES;

  return differenceInMinutes >= requiredDifference;
}
