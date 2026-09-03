import { describe, expect, it } from "vitest";
import {
  addSupportFeedbackSchema,
  createSupportRequestSchema,
  updateSupportStatusSchema,
} from "@/lib/validations/support";

describe("createSupportRequestSchema", () => {
  const valid = {
    kind: "bug" as const,
    title: "Calendar slot missing",
    body: "A Thursday morning slot disappeared after I blocked a date.",
  };

  it("accepts a valid request", () => {
    expect(createSupportRequestSchema.parse(valid).title).toBe("Calendar slot missing");
  });

  it("rejects a short description", () => {
    const parsed = createSupportRequestSchema.safeParse({ ...valid, body: "Help" });
    expect(parsed.success).toBe(false);
  });
});

describe("updateSupportStatusSchema", () => {
  it("requires notes when asking for more detail", () => {
    const parsed = updateSupportStatusSchema.safeParse({
      requestId: "abc",
      status: "needs_feedback",
      notes: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("allows resolving without notes", () => {
    const parsed = updateSupportStatusSchema.parse({
      requestId: "abc",
      status: "resolved",
    });
    expect(parsed.notes).toBeUndefined();
  });
});

describe("addSupportFeedbackSchema", () => {
  it("accepts a follow-up reply", () => {
    const parsed = addSupportFeedbackSchema.parse({
      requestId: "abc",
      body: "The missing slot was last Thursday at 09:00.",
    });
    expect(parsed.body).toContain("Thursday");
  });
});
