import { getTimezoneOffset } from "date-fns-tz";
import { expect, it, describe } from "@jest/globals";
import { addHours } from "date-fns";

import { validateScheduleOrderTime } from "./validateScheduleOrderTime";

describe("validateScheduleOrderTime", () => {
  const timezone = "America/New_York";
  const timezoneOffset = getTimezoneOffset(timezone, new Date());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true for a non-catering order with no date", () => {
    const dateToCheck = null;

    const result = validateScheduleOrderTime(dateToCheck, false);

    expect(result).toBe(true);
  });

  it("should return false for catering orders without a date", () => {
    const dateToCheck = null;

    const result = validateScheduleOrderTime(dateToCheck, true);

    expect(result).toBe(false);
  });

  it("should return false if dateToCheck not a valid date string", () => {
    const dateToCheck = "some random string";

    const result = validateScheduleOrderTime(dateToCheck);

    expect(result).toBe(false);
  });

  it("should return false if dateToCheck is in the past", () => {
    const dateToCheck = addHours(new Date(), -1);

    const result = validateScheduleOrderTime(dateToCheck);

    expect(result).toBe(false);
  });

  it("should return true if dateToCheck is at least 1 hour ahead, and is not a catering order", () => {
    const dateToCheck = addHours(new Date(), 2);

    const result = validateScheduleOrderTime(dateToCheck, false);

    expect(result).toBe(true);
  });

  it("should return false if dateToCheck is 1 hour ahead, and is a catering order", () => {
    const dateToCheck = addHours(new Date(), 2);

    const result = validateScheduleOrderTime(dateToCheck, true);

    expect(result).toBe(false);
  });

  it("should return true if dateToCheck is at least 48 hours ahead, and is a catering order", () => {
    const dateToCheck = addHours(new Date(), 49);

    const result = validateScheduleOrderTime(dateToCheck, true);

    expect(result).toBe(true);
  });
});
