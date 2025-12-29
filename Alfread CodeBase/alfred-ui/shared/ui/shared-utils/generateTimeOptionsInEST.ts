import { isSameDay, addMinutes, setMinutes, setSeconds, isBefore } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { convertTo12Hour } from "./convertTo12Hour";

export const generateTimeOptionsInEST = (selectedDate: Date, timezone: string) => {
  const currentZonedDate = utcToZonedTime(new Date(), timezone);
  const availableTimeSlots: string[] = [];

  let start: Date;
  let end: Date;

  if (isSameDay(selectedDate, currentZonedDate)) {
    start = addMinutes(currentZonedDate, 15);
    end = new Date(selectedDate);
    end.setHours(23, 59, 0, 0);
  } else {
    start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(selectedDate);
    end.setHours(23, 59, 0, 0);
  }

  let currentSlot = start;
  const minutes = currentSlot.getMinutes();
  if (minutes % 15 !== 0) {
    currentSlot = setMinutes(currentSlot, Math.ceil(minutes / 15) * 15);
    currentSlot = setSeconds(currentSlot, 0);
  }

  while (isBefore(currentSlot, end)) {
    const nextSlot = addMinutes(currentSlot, 15);
    availableTimeSlots.push(convertTo12Hour(currentSlot));
    currentSlot = nextSlot;
  }

  return availableTimeSlots;
};
