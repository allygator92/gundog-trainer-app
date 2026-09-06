import { afterEach, describe, expect, it } from "vitest";
import { getStripeWebhookSecret } from "@/lib/stripe";

describe("getStripeWebhookSecret", () => {
  const original = process.env.STRIPE_WEBHOOK_SECRET;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    } else {
      process.env.STRIPE_WEBHOOK_SECRET = original;
    }
  });

  it("returns the configured webhook secret", () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    expect(getStripeWebhookSecret()).toBe("whsec_test");
  });

  it("throws when the secret is missing", () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(() => getStripeWebhookSecret()).toThrow(/STRIPE_WEBHOOK_SECRET is not set/);
  });
});
