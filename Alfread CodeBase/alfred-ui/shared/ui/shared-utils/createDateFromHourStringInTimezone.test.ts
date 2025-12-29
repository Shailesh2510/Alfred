import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";
import {expect, it, describe} from '@jest/globals';

import createDateFromHourStringInTimezone from "./createDateFromHourStringInTimezone";

global.Date.prototype.getDate = jest.fn(() => 27);
global.Date.prototype.getMonth = jest.fn(() => 9);
global.Date.prototype.getFullYear = jest.fn(() => 2024);

describe("createDateFromHourStringInTimezone", () => {
    const timezone = "America/New_York";
    const timeFormat = "hh:mm aa zzz";
    const timezoneOffset = getTimezoneOffset(timezone, new Date());
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a date object with the correct time", () => {
        const hourString = "07:00:00";
        const expectedDate = new Date(Date.UTC(2024, 9, 27, 7, 0, 0, -timezoneOffset));
        const expectedDateString = formatInTimeZone(expectedDate, timezone, timeFormat);
    
        const result = createDateFromHourStringInTimezone(hourString, timezone);
    
        expect(result).toEqual(expectedDate);
        expect(formatInTimeZone(result, timezone, timeFormat)).toBe(expectedDateString);
    });
});