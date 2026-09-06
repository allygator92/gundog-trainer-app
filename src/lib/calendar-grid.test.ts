import { describe, expect, it } from "vitest";
import {
  addDaysToDateKey,
  formatDateKeyLong,
  formatMonthTitle,
  monthGrid,
  parseDateKey,
  shiftMonth,
  todayDateKey,
  utcDateKey,
  utcNoonFromDateKey,
} from "@/lib/calendar-grid";

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

  it("stores calendar dates at UTC noon so BST cannot shift the day", () => {
    const stored = utcNoonFromDateKey("2026-09-06");
    expect(stored.toISOString()).toBe("2026-09-06T12:00:00.000Z");
    expect(utcDateKey(stored)).toBe("2026-09-06");
  });

  it("formats month titles and long date keys in British English", () => {
    expect(formatMonthTitle(2026, 9)).toBe("September 2026");
    expect(formatDateKeyLong("2026-09-01")).toBe("Tuesday, 1 September 2026");
  });

  it("uses Europe/London for today so late UTC evening can be the next calendar day", () => {
    expect(todayDateKey(new Date("2026-09-06T23:30:00.000Z"))).toBe("2026-09-07");
  });
});
