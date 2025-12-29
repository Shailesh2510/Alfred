export const convertTo24Hour = (time12h: string): string => {
  const [time, period] = time12h.split(" ");
  const [hours, minutes] = time.split(":");
  let hoursNum = parseInt(hours);

  if (period === "PM" && hoursNum !== 12) {
    hoursNum += 12;
  } else if (period === "AM" && hoursNum === 12) {
    hoursNum = 0;
  }

  return `${hoursNum.toString().padStart(2, "0")}:${minutes}`;
};
