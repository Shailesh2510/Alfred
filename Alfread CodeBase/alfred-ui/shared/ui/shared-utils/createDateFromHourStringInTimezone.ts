import { getTimezoneOffset } from "date-fns-tz";

const createDateFromHourStringInTimezone = (dateString: string, timezone: string) => {
  const timezoneOffset = getTimezoneOffset(timezone, new Date());

  const hours = parseInt(dateString.substring(0, 2)) || 0;
  const minutes = parseInt(dateString.substring(3, 5)) || 0;
  const seconds = parseInt(dateString.substring(6, 8)) || 0;

  const newDate = new Date();
  return new Date(
    Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), hours, minutes, seconds, -timezoneOffset),
  );
};

export default createDateFromHourStringInTimezone;
