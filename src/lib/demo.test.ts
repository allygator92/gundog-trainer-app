import { describe, expect, it } from "vitest";
import { formatCardNumber } from "@/lib/demo";

describe("formatCardNumber", () => {
  it("groups a Stripe test card in fours", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });
});
