import { getTimezoneOffset } from "date-fns-tz";
import dateFnsTz from "date-fns-tz";
import {expect, it, describe} from '@jest/globals';

import { isWithinMealPeriod } from "./isWithinMealPeriod";

describe("isWithinMealPeriod", () => {
    const timezone = "America/New_York";
    const timezoneOffset = getTimezoneOffset(timezone, new Date());
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return true if current time is after midnight, before endHour, and endHour < startHour", () => {  
        const mealPeriodStartTime = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
        const mealPeriodEndTime = new Date(Date.UTC(2024, 9, 28, 7, 0, 0, -timezoneOffset));
        const currentTime = new Date(Date.UTC(2024, 9, 27, 5, 15, 0, -timezoneOffset));

        jest.spyOn(dateFnsTz, "utcToZonedTime").mockReturnValue(currentTime);

        const mealPeriodIsAvailable = isWithinMealPeriod(mealPeriodStartTime, mealPeriodEndTime, true);

        expect(mealPeriodIsAvailable).toBe(true);
    });

    it("should return false if current time is after midnight, after endHour, and endHour < startHour", () => {  
        const mealPeriodStartTime = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
        const mealPeriodEndTime = new Date(Date.UTC(2024, 9, 28, 7, 0, 0, -timezoneOffset));
        const currentTime = new Date(Date.UTC(2024, 9, 27, 8, 15, 0, -timezoneOffset));

        jest.spyOn(dateFnsTz, "utcToZonedTime").mockReturnValue(currentTime);

        const mealPeriodIsAvailable = isWithinMealPeriod(mealPeriodStartTime, mealPeriodEndTime, true);

        expect(mealPeriodIsAvailable).toBe(false);
    });

    it("should return false if current time is before midnight, before startHour, and endHour < startHour", () => {  
        
        const mealPeriodStartTime = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
        const mealPeriodEndTime = new Date(Date.UTC(2024, 9, 28, 7, 0, 0, -timezoneOffset));
        const currentTime = new Date(Date.UTC(2024, 9, 27, 22, 15, 0, -timezoneOffset));
        
        jest.spyOn(dateFnsTz, "utcToZonedTime").mockReturnValue(currentTime);

        const mealPeriodIsAvailable = isWithinMealPeriod(mealPeriodStartTime, mealPeriodEndTime, true);

        expect(mealPeriodIsAvailable).toBe(false);
    });

    it("should return true if current time is before midnight, after startHour, and endHour < startHour", () => {  
        
        const mealPeriodStartTime = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
        const mealPeriodEndTime = new Date(Date.UTC(2024, 9, 28, 7, 0, 0, -timezoneOffset));
        const currentTime = new Date(Date.UTC(2024, 9, 27, 23, 30, 0, -timezoneOffset));
        
        jest.spyOn(dateFnsTz, "utcToZonedTime").mockReturnValue(currentTime);

        const mealPeriodIsAvailable = isWithinMealPeriod(mealPeriodStartTime, mealPeriodEndTime, true);

        expect(mealPeriodIsAvailable).toBe(true);
    });

    it("should return true if current time is after startHour and endHour > startHour", () => {  
        const mealPeriodStartTime = new Date(Date.UTC(2024, 9, 27, 7, 0, 0, -timezoneOffset));
        const mealPeriodEndTime = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
        const currentTime = new Date(Date.UTC(2024, 9, 27, 15, 15, 0, -timezoneOffset));
        
        jest.spyOn(dateFnsTz, "utcToZonedTime").mockReturnValue(currentTime);

        const mealPeriodIsAvailable = isWithinMealPeriod(mealPeriodStartTime, mealPeriodEndTime, false);

        expect(mealPeriodIsAvailable).toBe(true);
    });

    it("should return false if current time is before startHour and endHour > startHour", () => {  
        const mealPeriodStartTime = new Date(Date.UTC(2024, 9, 27, 7, 0, 0, -timezoneOffset));
        const mealPeriodEndTime = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
        const currentTime = new Date(Date.UTC(2024, 9, 27, 5, 15, 0, -timezoneOffset));
        
        jest.spyOn(dateFnsTz, "utcToZonedTime").mockReturnValue(currentTime);

        const mealPeriodIsAvailable = isWithinMealPeriod(mealPeriodStartTime, mealPeriodEndTime, false);

        expect(mealPeriodIsAvailable).toBe(false);
    });

    it("should return false if current time is after endHour and endHour > startHour", () => {  
        const mealPeriodStartTime = new Date(Date.UTC(2024, 9, 27, 7, 0, 0, -timezoneOffset));
        const mealPeriodEndTime = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
        const currentTime = new Date(Date.UTC(2024, 9, 27, 23, 15, 0, -timezoneOffset));
        
        jest.spyOn(dateFnsTz, "utcToZonedTime").mockReturnValue(currentTime);

        const mealPeriodIsAvailable = isWithinMealPeriod(mealPeriodStartTime, mealPeriodEndTime, false);

        expect(mealPeriodIsAvailable).toBe(false);
    });

    it("should return true if current time is before endHour and endHour > startHour", () => {  
        const mealPeriodStartTime = new Date(Date.UTC(2024, 9, 27, 7, 0, 0, -timezoneOffset));
        const mealPeriodEndTime = new Date(Date.UTC(2024, 9, 27, 23, 0, 0, -timezoneOffset));
        const currentTime = new Date(Date.UTC(2024, 9, 27, 22, 15, 0, -timezoneOffset));
        
        jest.spyOn(dateFnsTz, "utcToZonedTime").mockReturnValue(currentTime);

        const mealPeriodIsAvailable = isWithinMealPeriod(mealPeriodStartTime, mealPeriodEndTime, false);

        expect(mealPeriodIsAvailable).toBe(true);
    });
});

