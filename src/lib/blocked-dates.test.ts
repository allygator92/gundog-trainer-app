import { describe, expect, it } from "vitest";
import { eachDateKeyInclusive, groupBlockedRanges, isDateKey } from "@/lib/blocked-dates";

describe("isDateKey", () => {
  it("accepts YYYY-MM-DD calendar keys", () => {
    expect(isDateKey("2026-09-07")).toBe(true);
    expect(isDateKey("07-09-2026")).toBe(false);
    expect(isDateKey("2026-9-7")).toBe(false);
  });
});

describe("eachDateKeyInclusive", () => {
  it("includes both ends and accepts reversed order", () => {
    expect(eachDateKeyInclusive("2026-09-03", "2026-09-01")).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ]);
  });
});

describe("groupBlockedRanges", () => {
  it("groups consecutive dates that share a reason", () => {
    const groups = groupBlockedRanges([
      { id: "a", dateKey: "2026-09-01", dateLabel: "Tue 1", reason: "Holiday" },
      { id: "b", dateKey: "2026-09-02", dateLabel: "Wed 2", reason: "Holiday" },
      { id: "c", dateKey: "2026-09-04", dateLabel: "Fri 4", reason: "Holiday" },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ ids: ["a", "b"], startKey: "2026-09-01", endKey: "2026-09-02" });
    expect(groups[1]).toMatchObject({ ids: ["c"], startKey: "2026-09-04", endKey: "2026-09-04" });
  });

  it("does not merge consecutive days with different reasons", () => {
    const groups = groupBlockedRanges([
      { id: "a", dateKey: "2026-09-01", dateLabel: "Tue 1", reason: "Holiday" },
      { id: "b", dateKey: "2026-09-02", dateLabel: "Wed 2", reason: "Travel" },
    ]);
    expect(groups).toHaveLength(2);
  });
});
