"use server";

import { addMinutes } from "date-fns";
import { getAppUrl } from "@/lib/app-url";
import {
  getAvailableSlots,
  getCalendarAvailability,
  occupiedWindow,
  parseSlotStart,
  releaseExpiredHolds,
  windowsOverlap,
} from "@/lib/availability";
import { createManageToken } from "@/lib/booking-manage";
import { buildCheckoutSessionParams } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function getSlotsAction(serviceId: string) {
  if (!serviceId) {
    return { slots: [], fullDateKeys: [] as string[] };
  }
  return getCalendarAvailability(serviceId);
}

export async function createCheckoutAction(input: {
  serviceId: string;
  startsAt: string;
  clientId: string;
  dogId: string;
}) {
  const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
  if (!service?.isActive) {
    return { ok: false as const, error: "That session is not available." };
  }

  const client = await prisma.client.findUnique({ where: { id: input.clientId } });
  const dog = await prisma.dog.findUnique({ where: { id: input.dogId } });
  if (!client || !dog || dog.clientId !== client.id) {
    return { ok: false as const, error: "Please complete the intake form first." };
  }

  if (service.type === "in_person" && !client.address) {
    return { ok: false as const, error: "An address is required for in-person sessions." };
  }

  const startsAt = parseSlotStart(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false as const, error: "That time is not valid." };
  }

  await releaseExpiredHolds();

  const slotStillOpen = (await getAvailableSlots(service.id)).some(
    (slot) => slot.startsAt === startsAt.toISOString(),
  );
  if (!slotStillOpen) {
    return { ok: false as const, error: "That time has just been taken. Please pick another slot." };
  }

  const overlapping = await prisma.booking.findMany({
    where: {
      status: { in: ["pending_payment", "confirmed"] },
      startsAt: {
        gte: addMinutes(startsAt, -4 * 60),
        lte: addMinutes(startsAt, service.durationMinutes + 4 * 60),
      },
    },
    include: { service: { select: { durationMinutes: true, type: true } } },
  });

  const proposed = occupiedWindow(startsAt, service.durationMinutes, service.type);
  const clash = overlapping.some((booking) =>
    windowsOverlap(proposed, occupiedWindow(booking.startsAt, booking.service.durationMinutes, booking.service.type)),
  );
  if (clash) {
    return { ok: false as const, error: "That time has just been taken. Please pick another slot." };
  }

  const appUrl = getAppUrl();

  const booking = await prisma.booking.create({
    data: {
      clientId: client.id,
      dogId: dog.id,
      serviceId: service.id,
      startsAt,
      status: "pending_payment",
      meetingType: service.type,
      address: service.type === "in_person" ? client.address : undefined,
      manageToken: createManageToken(),
    },
  });

  try {
    const session = await getStripe().checkout.sessions.create(
      buildCheckoutSessionParams({
        appUrl,
        bookingId: booking.id,
        customerEmail: client.email,
        expiresAtUnix: Math.floor(Date.now() / 1000) + 30 * 60,
        service: {
          name: service.name,
          type: service.type,
          durationMinutes: service.durationMinutes,
          pricePence: service.pricePence,
        },
      }),
    );

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    await prisma.document.updateMany({
      where: {
        clientId: client.id,
        type: "intake_pdf",
        bookingId: null,
        storagePath: { contains: dog.id },
      },
      data: { bookingId: booking.id },
    });

    return { ok: true as const, url: session.url };
  } catch (error) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "cancelled" },
    });
    console.error("Checkout create failed:", error);
    return {
      ok: false as const,
      error: "Could not start payment. Check Stripe test keys and try again.",
    };
  }
}
