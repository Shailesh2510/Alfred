import { RIDE_DIFFERENCE_TIME_IN_MINUTES, PAY_LATER_DIFFERENCE_TIME_IN_MINUTES } from "../shared-constants";
import { validateScheduleRideTime } from "./validateScheduleRideTime";
import * as dateFns from "date-fns-tz";

jest.mock("date-fns-tz", () => ({
  utcToZonedTime: jest.fn(),
}));

describe("validateScheduleRideTime", () => {
  const mockNow = new Date("2024-01-10T10:00:00Z");
  const timezone = "America/New_York";

  beforeEach(() => {
    jest.resetAllMocks();
    (dateFns.utcToZonedTime as jest.Mock).mockReturnValue(mockNow);
  });

  it("returns true when dateToCheck is null", () => {
    expect(validateScheduleRideTime(null, timezone)).toBe(true);
  });

  it("returns false for invalid date string", () => {
    expect(validateScheduleRideTime("invalid-date", timezone)).toBe(false);
  });

  it("validates regular ride with sufficient time difference", () => {
    const futureDate = new Date(mockNow.getTime() + RIDE_DIFFERENCE_TIME_IN_MINUTES * 60 * 1000);
    expect(validateScheduleRideTime(futureDate.toISOString(), timezone)).toBe(true);
  });

  it("validates regular ride with insufficient time difference", () => {
    const futureDate = new Date(mockNow.getTime() + (RIDE_DIFFERENCE_TIME_IN_MINUTES - 1) * 60 * 1000);
    expect(validateScheduleRideTime(futureDate.toISOString(), timezone)).toBe(false);
  });

  it("validates pay later ride with sufficient time difference", () => {
    const futureDate = new Date(mockNow.getTime() + PAY_LATER_DIFFERENCE_TIME_IN_MINUTES * 60 * 1000);
    expect(validateScheduleRideTime(futureDate.toISOString(), timezone, true)).toBe(true);
  });

  it("validates pay later ride with insufficient time difference", () => {
    const futureDate = new Date(mockNow.getTime() + (PAY_LATER_DIFFERENCE_TIME_IN_MINUTES - 1) * 60 * 1000);
    expect(validateScheduleRideTime(futureDate.toISOString(), timezone, true)).toBe(false);
  });

  it("handles ISO string date input", () => {
    const futureDate = new Date(mockNow.getTime() + RIDE_DIFFERENCE_TIME_IN_MINUTES * 60 * 1000);
    expect(validateScheduleRideTime(futureDate.toISOString(), timezone)).toBe(true);
  });

  it("handles different date string formats", () => {
    const futureDate = new Date(mockNow.getTime() + RIDE_DIFFERENCE_TIME_IN_MINUTES * 60 * 1000);
    expect(validateScheduleRideTime(futureDate.toString(), timezone)).toBe(true);
  });
});
