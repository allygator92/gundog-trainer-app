import type Stripe from "stripe";
import { sendBookingConfirmationEmails } from "@/lib/email";
import { paymentIntentIdFromSession } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";

const CONFIRM_TYPES = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);
const RELEASE_TYPES = new Set(["checkout.session.expired", "checkout.session.async_payment_failed"]);

export type CheckoutEventResult =
  | { action: "ignored" }
  | { action: "confirmed" | "already_confirmed" | "cancelled"; bookingId: string };

export async function applyCheckoutSessionEvent(event: Stripe.Event): Promise<CheckoutEventResult> {
  if (!CONFIRM_TYPES.has(event.type) && !RELEASE_TYPES.has(event.type)) {
    return { action: "ignored" };
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.bookingId ?? session.client_reference_id;
  if (!bookingId) {
    return { action: "ignored" };
  }

  if (CONFIRM_TYPES.has(event.type)) {
    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        dog: true,
        service: true,
      },
    });

    if (!existing) {
      return { action: "ignored" };
    }

    if (existing.status === "confirmed") {
      return { action: "already_confirmed", bookingId };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "confirmed",
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentIdFromSession(session.payment_intent),
      },
    });

    await sendBookingConfirmationEmails({
      clientName: existing.client.name,
      clientEmail: existing.client.email,
      dogName: existing.dog.name,
      serviceName: existing.service.name,
      meetingType: existing.meetingType,
      startsAt: existing.startsAt,
      durationMinutes: existing.service.durationMinutes,
      pricePence: existing.service.pricePence,
      address: existing.address,
    });

    return { action: "confirmed", bookingId };
  }

  await prisma.booking.updateMany({
    where: { id: bookingId, status: "pending_payment" },
    data: { status: "cancelled" },
  });

  return { action: "cancelled", bookingId };
}
