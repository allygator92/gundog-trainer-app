"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getAppUrl } from "@/lib/app-url";
import { formatBookingWhen } from "@/lib/booking-email";
import { canReschedule } from "@/lib/booking-manage";
import { getAvailableSlots, occupiedWindow, parseSlotStart, windowsOverlap } from "@/lib/availability";
import { sendBookingCancelledEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { notifyWaitlistForDate } from "@/lib/waitlist";
import { addMinutes } from "date-fns";

async function loadManagedBooking(token: string) {
  if (!token) {
    return null;
  }
  return prisma.booking.findUnique({
    where: { manageToken: token },
    include: { client: true, dog: true, service: true },
  });
}

export async function cancelManagedBookingAction(token: string) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`manage:${ip}`, 10, 60 * 60 * 1000)) {
    return { ok: false as const, error: "Too many attempts. Please try again later." };
  }

  const booking = await loadManagedBooking(token);
  if (!booking || booking.status === "cancelled") {
    return { ok: false as const, error: "That booking is not available to cancel." };
  }
  if (booking.status !== "confirmed") {
    return { ok: false as const, error: "Only confirmed bookings can be cancelled here." };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "cancelled" },
  });

  const bookUrl = `${getAppUrl()}/book`;
  await sendBookingCancelledEmail({
    clientName: booking.client.name,
    clientEmail: booking.client.email,
    dogName: booking.dog.name,
    when: formatBookingWhen(booking.startsAt),
    bookUrl,
  });
  await notifyWaitlistForDate(booking.startsAt);

  revalidatePath("/book");
  revalidatePath("/admin/bookings");
  return { ok: true as const };
}

export async function rescheduleManagedBookingAction(token: string, startsAtValue: string) {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`manage:${ip}`, 10, 60 * 60 * 1000)) {
    return { ok: false as const, error: "Too many attempts. Please try again later." };
  }

  const booking = await loadManagedBooking(token);
  if (!booking || booking.status !== "confirmed") {
    return { ok: false as const, error: "That booking cannot be moved." };
  }
  if (!canReschedule(booking.startsAt)) {
    return { ok: false as const, error: "Please give at least 24 hours’ notice to reschedule, or cancel and get in touch." };
  }

  const startsAt = parseSlotStart(startsAtValue);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false as const, error: "That time is not valid." };
  }

  const open = (await getAvailableSlots(booking.serviceId, booking.id)).some(
    (slot) => slot.startsAt === startsAt.toISOString(),
  );
  if (!open) {
    return { ok: false as const, error: "That time has just been taken. Please pick another slot." };
  }

  const neighbours = await prisma.booking.findMany({
    where: {
      id: { not: booking.id },
      status: { in: ["pending_payment", "confirmed"] },
      startsAt: {
        gte: addMinutes(startsAt, -4 * 60),
        lte: addMinutes(startsAt, booking.service.durationMinutes + 4 * 60),
      },
    },
    include: { service: { select: { durationMinutes: true, type: true } } },
  });
  const proposed = occupiedWindow(startsAt, booking.service.durationMinutes, booking.service.type);
  if (
    neighbours.some((row) =>
      windowsOverlap(proposed, occupiedWindow(row.startsAt, row.service.durationMinutes, row.service.type)),
    )
  ) {
    return { ok: false as const, error: "That time has just been taken. Please pick another slot." };
  }

  const previousStart = booking.startsAt;
  await prisma.booking.update({
    where: { id: booking.id },
    data: { startsAt, reminderSentAt: null },
  });
  await notifyWaitlistForDate(previousStart);

  revalidatePath("/book");
  revalidatePath("/admin/bookings");
  return { ok: true as const };
}
