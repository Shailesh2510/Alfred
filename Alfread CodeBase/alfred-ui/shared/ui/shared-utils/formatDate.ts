import { format } from "date-fns";

export const shortDateFromat = "MM/dd/yyyy";
export const longDateFormat = "MM/dd/yyyy hh:mm a";
export const longDateFormatWithTimezone = "MM/dd/yyyy hh:mm a (zzz)";

const formatDate = (date: Date, dateFormat: string = shortDateFromat) => {
  if (dateFormat) return format(date, dateFormat);
};

export default formatDate;
