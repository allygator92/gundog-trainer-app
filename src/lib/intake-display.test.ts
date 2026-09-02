import { describe, expect, it } from "vitest";
import { intakeRows } from "@/lib/intake-display";

describe("intakeRows", () => {
  it("skips empty and internal fields", () => {
    expect(
      intakeRows({
        dogName: "Bramble",
        recall: "good",
        fearTriggers: "",
        botField: "spam",
        consentDataStorage: true,
      }),
    ).toEqual([
      { label: "Dog", value: "Bramble" },
      { label: "Recall", value: "good" },
    ]);
  });

  it("returns nothing for missing snapshots", () => {
    expect(intakeRows(null)).toEqual([]);
  });
});
