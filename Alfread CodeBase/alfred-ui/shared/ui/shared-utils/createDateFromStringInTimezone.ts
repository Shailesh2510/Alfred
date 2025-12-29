import { getTimezoneOffset } from "date-fns-tz";

const createDateFromStringInTimezone = ({ dateString, timezone, dateObj }: any) => {
  const timezoneOffset = getTimezoneOffset(timezone, new Date());

  const year = dateObj?.year ? dateObj?.year : parseInt(dateString?.substring(0, 4));
  const month = dateObj?.month ? dateObj?.month : parseInt(dateString?.substring(5, 7));
  const day = dateObj?.day ? dateObj?.day : parseInt(dateString?.substring(8, 10));
  const hours = dateObj?.hour ? dateObj?.hour : parseInt(dateString?.substring(11, 13));
  const minutes = dateObj?.minute ? dateObj?.minute : parseInt(dateString?.substring(14, 16));
  const seconds = dateObj?.year ? dateObj?.second : parseInt(dateString?.substring(17, 19));

  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, -timezoneOffset));
};

export default createDateFromStringInTimezone;
