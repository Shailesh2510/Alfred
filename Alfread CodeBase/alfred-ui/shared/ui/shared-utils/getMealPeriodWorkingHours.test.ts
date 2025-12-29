import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";
import {expect, it, describe} from '@jest/globals';

import getMealPeriodWorkingHours from "./getMealPeriodWorkingHours";

//jest.mock("./createDateFromHourStringInTimezone", () => jest.fn((dateString, timezone) => new Date("2024-10-27T" + dateString + ".000Z")));
global.Date.prototype.getDate = jest.fn(() => 27);
global.Date.prototype.getMonth = jest.fn(() => 9);
global.Date.prototype.getFullYear = jest.fn(() => 2024);

describe("getMealPeriodWorkingHours", () => {
  const timezone = "America/New_York";
  const timeFormat = "hh:mm aa zzz";
  const timezoneOffset = getTimezoneOffset(timezone, new Date());
 
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return correct meal period times when startHour < endHour", () => {
    const startHour = "07:00:00";
    const endHour = "23:00:00";

    const startDate = new Date(Date.UTC(2024, 9, 27, 7, 0, 0, -timezoneOffset));
    const endDate = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
    const startDateTimeString = formatInTimeZone(startDate, timezone, timeFormat);
    const endDateTimeString = formatInTimeZone(endDate, timezone, timeFormat);

    const result = getMealPeriodWorkingHours({ startHour, endHour, timezone, timeFormat });
  
    expect(result.isLateNightMeal).toBe(false);
    expect(result.mealPeriodStartTime).toEqual(startDate);
    expect(result.mealPeriodEndTime).toEqual(endDate);
    expect(result.mealPeriodStartTimeString).toBe(startDateTimeString);
    expect(result.mealPeriodEndTimeString).toBe(endDateTimeString);
  });

  it("should handle late night meals when endHour < startHour", () => {
    const startHour = "23:00:00";
    const endHour = "07:00:00";
    
    const startDate = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
    const endDate = new Date(Date.UTC(2024, 9, 28, 7, 0, 0, -timezoneOffset));
    const startDateTimeString = formatInTimeZone(startDate, timezone, timeFormat);
    const endDateTimeString = formatInTimeZone(endDate, timezone, timeFormat);

    const result = getMealPeriodWorkingHours({ startHour, endHour, timezone, timeFormat });
  
    expect(result.isLateNightMeal).toBe(true);
    expect(result.mealPeriodStartTime).toEqual(startDate);
    expect(result.mealPeriodEndTime).toEqual(endDate);
    expect(result.mealPeriodStartTimeString).toBe(startDateTimeString);
    expect(result.mealPeriodEndTimeString).toBe(endDateTimeString);
  });
});