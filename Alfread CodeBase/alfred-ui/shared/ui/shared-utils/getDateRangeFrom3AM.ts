import { zonedTimeToUtc, utcToZonedTime, format } from "date-fns-tz";
import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";

function getDateRangeFrom3AM() {
  // const timeZone = "America/New_York";
  const now = new Date();

  // const zonedDate = utcToZonedTime(now, timeZone);

  // const startOfRangeZoned = setHours(setMinutes(setSeconds(setMilliseconds(zonedDate, 0), 0), 0), 3);
  // const endOfRangeZoned = addDays(startOfRangeZoned, 1);

  // const startOfRangeUtc = zonedTimeToUtc(startOfRangeZoned, timeZone);
  // const endOfRangeUtc = zonedTimeToUtc(endOfRangeZoned, timeZone);

  // return {
  //   startOfRange: format(startOfRangeUtc, "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
  //   endOfRange: format(endOfRangeUtc, "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
  // };

  const startOfRange = setHours(setMinutes(setSeconds(setMilliseconds(now, 0), 0), 0), 3);
  const endOfRange = addDays(startOfRange, 1);

  return {
    startOfRange: format(startOfRange, "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    endOfRange: format(endOfRange, "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
  };
}

export default getDateRangeFrom3AM;
