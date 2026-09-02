import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  BOOKING_TIMEZONE,
  DAYS_AHEAD,
  PENDING_HOLD_MINUTES,
  WEEKDAYS,
  buildAvailableSlots,
  defaultWeeklyHours,
  londonDay,
  parseLondon,
  parseSlotStart,
  type AvailableSlot,
} from "@/lib/availability-slots";

export {
  BOOKING_TIMEZONE,
  DAYS_AHEAD,
  PENDING_HOLD_MINUTES,
  WEEKDAYS,
  buildAvailableSlots,
  defaultWeeklyHours,
  londonDay,
  parseLondon,
  parseSlotStart,
  type AvailableSlot,
};

export async function releaseExpiredHolds() {
  const cutoff = addMinutes(new Date(), -PENDING_HOLD_MINUTES);
  await prisma.booking.updateMany({
    where: {
      status: "pending_payment",
      createdAt: { lt: cutoff },
    },
    data: { status: "cancelled" },
  });
}

export async function getAvailableSlots(serviceId: string): Promise<AvailableSlot[]> {
  await releaseExpiredHolds();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service?.isActive) {
    return [];
  }

  const now = new Date();
  const rangeStart = parseLondon(londonDay(now), "00:00");
  const rangeEnd = addMinutes(rangeStart, DAYS_AHEAD * 24 * 60);

  const [rules, blocked, bookings] = await Promise.all([
    prisma.availabilityRule.findMany({ where: { isActive: true } }),
    prisma.blockedDate.findMany({
      where: { date: { gte: rangeStart, lte: rangeEnd } },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ["pending_payment", "confirmed"] },
        startsAt: { gte: now, lte: rangeEnd },
      },
      include: { service: { select: { durationMinutes: true } } },
    }),
  ]);

  return buildAvailableSlots({
    now,
    durationMinutes: service.durationMinutes,
    rules,
    blockedDays: blocked.map((row) => londonDay(row.date)),
    occupied: bookings.map((booking) => ({
      start: booking.startsAt,
      end: addMinutes(booking.startsAt, booking.service.durationMinutes),
    })),
  });
}
