import { describe, expect, it } from "vitest";
import { waitlistSchema } from "@/lib/validations/waitlist";

describe("waitlistSchema", () => {
  const valid = {
    name: "Sam Owner",
    email: "sam@example.com",
    dateKey: "2026-09-07",
  };

  it("accepts a name, email, and calendar date", () => {
    expect(waitlistSchema.parse(valid)).toMatchObject(valid);
  });

  it("trims fields and keeps an optional service id", () => {
    const parsed = waitlistSchema.parse({
      name: "  Sam Owner  ",
      email: "  sam@example.com  ",
      dateKey: "2026-09-07",
      serviceId: "svc_1",
    });
    expect(parsed.name).toBe("Sam Owner");
    expect(parsed.email).toBe("sam@example.com");
    expect(parsed.serviceId).toBe("svc_1");
  });

  it("rejects a short name, bad email, or malformed date", () => {
    expect(waitlistSchema.safeParse({ ...valid, name: "S" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ ...valid, dateKey: "07-09-2026" }).success).toBe(false);
  });
});
