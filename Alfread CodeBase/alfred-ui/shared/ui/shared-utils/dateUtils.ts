export const adjustDateForOvernight = (date: Date, hour: number, minute: number = 0): Date => {
  const now = new Date();
  const result = new Date(now);
  result.setHours(hour, minute, 0, 0);

  if (hour < now.getHours() && hour < 12) {
    result.setDate(result.getDate() + 1);
  } else if (hour > now.getHours() && hour >= 12 && now.getHours() < 12) {
    result.setDate(result.getDate() - 1);
  }

  return result;
};

export const isWithinOvernightInterval = (
  date: Date,
  startHour: string,
  endHour: string,
  timezone: string
): boolean => {
  try {
    const [startHourStr, startMinStr = "0"] = startHour.split(":");
    const [endHourStr, endMinStr = "0"] = endHour.split(":");

    const startHourNum = parseInt(startHourStr, 10);
    const startMinNum = parseInt(startMinStr, 10);
    const endHourNum = parseInt(endHourStr, 10);
    const endMinNum = parseInt(endMinStr, 10);

    const startDate = adjustDateForOvernight(date, startHourNum, startMinNum);
    const endDate = adjustDateForOvernight(date, endHourNum, endMinNum);

    if (endHourNum < startHourNum) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const nowDate = new Date();
    return nowDate >= startDate && nowDate <= endDate;
  } catch (error) {
    console.error("Error in isWithinOvernightInterval:", error);
    return false;
  }
};
