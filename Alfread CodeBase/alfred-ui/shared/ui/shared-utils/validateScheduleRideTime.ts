import { utcToZonedTime } from "date-fns-tz";
import { PAY_LATER_DIFFERENCE_TIME_IN_MINUTES, RIDE_DIFFERENCE_TIME_IN_MINUTES } from "../shared-constants";

export function validateScheduleRideTime(
  dateToCheck: string | null,
  timezone: string,
  calculatePayLater: boolean = false
): boolean {
  if (!dateToCheck) {
    return true;
  }

  const date = typeof dateToCheck === "string" ? new Date(dateToCheck) : dateToCheck;

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = utcToZonedTime(new Date(), timezone);
  const timeDifference = date.getTime() - now.getTime();
  const differenceInMinutes = timeDifference / (1000 * 60);

  if (calculatePayLater) {
    return differenceInMinutes >= PAY_LATER_DIFFERENCE_TIME_IN_MINUTES;
  }

  return differenceInMinutes >= RIDE_DIFFERENCE_TIME_IN_MINUTES;
}
