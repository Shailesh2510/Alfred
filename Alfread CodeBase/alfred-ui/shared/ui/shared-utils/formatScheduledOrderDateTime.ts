import { parse, format } from "date-fns";
import { utcToZonedTime, formatInTimeZone } from "date-fns-tz";

const formatScheduledOrderDateTime = (scheduledDate: string, timezone: string) => {
  const cleanedDate = scheduledDate.replace(/\s\([A-Z]+\)$/, "");

  const parsedDate = parse(cleanedDate, "MM/dd/yyyy hh:mm a", new Date());

  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  const zonedDate = utcToZonedTime(parsedDate, timezone);

  const formattedDate = formatInTimeZone(zonedDate, timezone, "yyyy-MM-dd HH:mm:ss.SSS XXX");

  return formattedDate;
};

export default formatScheduledOrderDateTime;
