import { describe, expect, it } from "vitest";
import { addDaysToDateKey, monthGrid, parseDateKey, shiftMonth } from "@/lib/calendar-grid";

describe("monthGrid", () => {
  it("starts the week on Monday", () => {
    const cells = monthGrid(2026, 9);
    expect(cells[0]?.dateKey).toBe("2026-08-31");
    expect(cells[1]?.dateKey).toBe("2026-09-01");
    expect(cells[1]?.inMonth).toBe(true);
    expect(cells[0]?.inMonth).toBe(false);
  });
});

describe("date key helpers", () => {
  it("adds days across month boundaries", () => {
    expect(addDaysToDateKey("2026-09-30", 1)).toBe("2026-10-01");
    expect(parseDateKey("2026-10-01")).toEqual({ year: 2026, month: 10, day: 1 });
  });

  it("shifts months into the next year", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });
});
