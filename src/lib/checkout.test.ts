import { describe, expect, it } from "vitest";
import { buildCheckoutSessionParams, paymentIntentIdFromSession } from "@/lib/checkout";

describe("buildCheckoutSessionParams", () => {
  it("points Stripe back to the local confirmation and cancel URLs", () => {
    const params = buildCheckoutSessionParams({
      appUrl: "http://localhost:3000",
      bookingId: "booking_123",
      customerEmail: "sam@example.com",
      expiresAtUnix: 1_800_000_000,
      service: {
        name: "Virtual Training Session",
        type: "virtual",
        durationMinutes: 60,
        pricePence: 6500,
      },
    });

    expect(params.mode).toBe("payment");
    expect(params.client_reference_id).toBe("booking_123");
    expect(params.metadata).toEqual({ bookingId: "booking_123" });
    expect(params.success_url).toBe("http://localhost:3000/book/confirmed?bookingId=booking_123");
    expect(params.cancel_url).toBe("http://localhost:3000/book?cancelled=1");
    expect(params.line_items[0]?.price_data?.unit_amount).toBe(6500);
    expect(params.line_items[0]?.price_data?.currency).toBe("gbp");
  });
});

describe("paymentIntentIdFromSession", () => {
  it("reads a string or expanded payment intent", () => {
    expect(paymentIntentIdFromSession("pi_123")).toBe("pi_123");
    expect(paymentIntentIdFromSession({ id: "pi_456" })).toBe("pi_456");
    expect(paymentIntentIdFromSession(null)).toBeUndefined();
  });
});
