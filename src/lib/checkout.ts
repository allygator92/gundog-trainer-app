export function buildCheckoutSessionParams(input: {
  appUrl: string;
  bookingId: string;
  customerEmail: string;
  expiresAtUnix: number;
  service: {
    name: string;
    type: "virtual" | "in_person";
    durationMinutes: number;
    pricePence: number;
  };
}) {
  return {
    mode: "payment" as const,
    customer_email: input.customerEmail,
    client_reference_id: input.bookingId,
    metadata: { bookingId: input.bookingId },
    success_url: `${input.appUrl}/book/confirmed?bookingId=${input.bookingId}`,
    cancel_url: `${input.appUrl}/book?cancelled=1`,
    expires_at: input.expiresAtUnix,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp" as const,
          unit_amount: input.service.pricePence,
          product_data: {
            name: input.service.name,
            description: `${input.service.durationMinutes} minute ${
              input.service.type === "virtual" ? "virtual" : "in-person"
            } session`,
          },
        },
      },
    ],
  };
}

export function paymentIntentIdFromSession(paymentIntent: unknown): string | undefined {
  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }
  if (paymentIntent && typeof paymentIntent === "object" && "id" in paymentIntent) {
    const id = (paymentIntent as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}
