import { describe, expect, it } from "vitest";
import { getDeveloperEmail, isSupportKind, isSupportStatus, supportStatusStepIndex } from "@/lib/support";

describe("getDeveloperEmail", () => {
  it("uses the configured address when set", () => {
    expect(getDeveloperEmail({ DEVELOPER_EMAIL: "dev@example.com" })).toBe("dev@example.com");
  });

  it("falls back to the project default", () => {
    expect(getDeveloperEmail({ DEVELOPER_EMAIL: "  " })).toBe("alisongrant141@gmail.com");
  });
});

describe("support helpers", () => {
  it("accepts known kinds and statuses", () => {
    expect(isSupportKind("bug")).toBe(true);
    expect(isSupportKind("other")).toBe(false);
    expect(isSupportStatus("investigating")).toBe(true);
    expect(isSupportStatus("open")).toBe(false);
  });

  it("orders the status bar steps", () => {
    expect(supportStatusStepIndex("submitted")).toBe(0);
    expect(supportStatusStepIndex("resolved")).toBe(3);
  });
});
