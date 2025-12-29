export function createDateFromString(dateString: string) {
  if (!dateString) return new Date();

  try {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(5, 7));
    const date = parseInt(dateString.substring(8, 10));
    const hours = parseInt(dateString.substring(11, 13));
    const minutes = parseInt(dateString.substring(14, 16));
    const seconds = parseInt(dateString.substring(17, 19));

    const utcDate = new Date(Date.UTC(year, month - 1, date, hours, minutes, seconds));

    if (isNaN(utcDate.getTime())) {
      return new Date();
    }

    return utcDate;
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date();
  }
}
