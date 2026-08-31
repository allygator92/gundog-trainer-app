import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook signature verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.expired" &&
    event.type !== "checkout.session.async_payment_failed"
  ) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.bookingId ?? session.client_reference_id;

  if (bookingId && (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded")) {
    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { status: true },
    });

    if (existing && existing.status !== "confirmed") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "confirmed",
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id,
        },
      });
    }
  }

  if (
    bookingId &&
    (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed")
  ) {
    await prisma.booking.updateMany({
      where: { id: bookingId, status: "pending_payment" },
      data: { status: "cancelled" },
    });
  }

  return NextResponse.json({ received: true });
}
