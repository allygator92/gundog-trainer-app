import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique, update, updateMany, sendBookingConfirmationEmails } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  sendBookingConfirmationEmails: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findUnique,
      update,
      updateMany,
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendBookingConfirmationEmails,
}));

import { applyCheckoutSessionEvent } from "@/lib/checkout-events";

function checkoutEvent(
  type: Stripe.Event["type"],
  session: Partial<Stripe.Checkout.Session> = {},
): Stripe.Event {
  return {
    type,
    data: {
      object: {
        id: "cs_test_1",
        metadata: { bookingId: "booking_1" },
        client_reference_id: "booking_1",
        payment_intent: "pi_1",
        ...session,
      },
    },
  } as Stripe.Event;
}

const pendingBooking = {
  id: "booking_1",
  status: "pending_payment",
  meetingType: "virtual",
  startsAt: new Date("2026-09-01T09:00:00.000Z"),
  address: null,
  client: { name: "Sam Owner", email: "sam@example.com" },
  dog: { name: "Moss" },
  service: { name: "Virtual Training Session", durationMinutes: 60, pricePence: 6500 },
};

describe("applyCheckoutSessionEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendBookingConfirmationEmails.mockResolvedValue(true);
    update.mockResolvedValue({});
    updateMany.mockResolvedValue({ count: 1 });
  });

  it("confirms a pending booking once and emails client and trainer", async () => {
    findUnique.mockResolvedValue(pendingBooking);

    const first = await applyCheckoutSessionEvent(checkoutEvent("checkout.session.completed"));
    expect(first).toEqual({ action: "confirmed", bookingId: "booking_1" });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "confirmed", stripePaymentIntentId: "pi_1" }),
      }),
    );
    expect(sendBookingConfirmationEmails).toHaveBeenCalledTimes(1);

    findUnique.mockResolvedValue({ ...pendingBooking, status: "confirmed" });
    const second = await applyCheckoutSessionEvent(checkoutEvent("checkout.session.completed"));
    expect(second.action).toBe("already_confirmed");
    expect(sendBookingConfirmationEmails).toHaveBeenCalledTimes(1);
  });

  it("releases the slot when checkout expires", async () => {
    const result = await applyCheckoutSessionEvent(checkoutEvent("checkout.session.expired"));
    expect(result).toEqual({ action: "cancelled", bookingId: "booking_1" });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "booking_1", status: "pending_payment" },
      data: { status: "cancelled" },
    });
    expect(sendBookingConfirmationEmails).not.toHaveBeenCalled();
  });

  it("ignores unrelated Stripe events", async () => {
    const result = await applyCheckoutSessionEvent({
      type: "charge.succeeded",
      data: { object: { id: "ch_1" } },
    } as Stripe.Event);
    expect(result).toEqual({ action: "ignored" });
  });
});
