import { isWithInOverNightTimeRange } from "./isWithInOverNightTimeRange";
import { advanceTo, clear } from "jest-date-mock";

describe("isWithInOverNightTimeRange", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    clear();
  });

  it("should be false for 11AM EST Current Date", () => {
    const date = new Date();
    date.setHours(11, 0, 0);
    advanceTo(date);
    expect(isWithInOverNightTimeRange()).toBe(false);
  });

  it("should be false for 08PM EST Current Date", () => {
    const date = new Date();
    date.setHours(20, 0, 0);
    advanceTo(date);
    expect(isWithInOverNightTimeRange()).toBe(false);
  });

  it("should be true for 11:45PM EST Current Date", () => {
    const date = new Date();
    date.setHours(23, 45, 0);
    advanceTo(date);
    expect(isWithInOverNightTimeRange()).toBe(true);
  });

  it("should be true for 12:30 AM EST Next Date", () => {
    const date = new Date();
    date.setHours(0, 30, 0);
    advanceTo(date);
    expect(isWithInOverNightTimeRange()).toBe(true);
  });

  it("should be true for 06AM EST Next Date", () => {
    const date = new Date();
    date.setHours(6, 0, 0);
    advanceTo(date);
    expect(isWithInOverNightTimeRange()).toBe(true);
  });

  it("should be false for 08AM EST Next Date", () => {
    const date = new Date();
    date.setHours(8, 0, 0);
    advanceTo(date);
    expect(isWithInOverNightTimeRange()).toBe(false);
  });
});
