import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  BOOKING_TIMEZONE,
  DAYS_AHEAD,
  PENDING_HOLD_MINUTES,
  WEEKDAYS,
  breakHoursError,
  buildAvailableSlots,
  buildOpenDateKeys,
  defaultWeeklyHours,
  londonDay,
  occupiedWindow,
  parseLondon,
  parseSlotStart,
  rulesFromDayHours,
  sessionBufferMinutes,
  windowsOverlap,
  type AvailableSlot,
  type DayHours,
} from "@/lib/availability-slots";

export {
  BOOKING_TIMEZONE,
  DAYS_AHEAD,
  PENDING_HOLD_MINUTES,
  WEEKDAYS,
  breakHoursError,
  buildAvailableSlots,
  buildOpenDateKeys,
  defaultWeeklyHours,
  londonDay,
  occupiedWindow,
  parseLondon,
  parseSlotStart,
  rulesFromDayHours,
  sessionBufferMinutes,
  windowsOverlap,
  type AvailableSlot,
  type DayHours,
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

export async function getAvailableSlots(serviceId: string, ignoreBookingId?: string): Promise<AvailableSlot[]> {
  const calendar = await getCalendarAvailability(serviceId, ignoreBookingId);
  return calendar.slots;
}

export async function getCalendarAvailability(serviceId: string, ignoreBookingId?: string) {
  await releaseExpiredHolds();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service?.isActive) {
    return { slots: [] as AvailableSlot[], fullDateKeys: [] as string[] };
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
        startsAt: { gte: addMinutes(now, -24 * 60), lte: rangeEnd },
        ...(ignoreBookingId ? { id: { not: ignoreBookingId } } : {}),
      },
      include: { service: { select: { durationMinutes: true, type: true } } },
    }),
  ]);

  const blockedDays = blocked.map((row) => londonDay(row.date));
  const occupied = bookings.map((booking) =>
    occupiedWindow(booking.startsAt, booking.service.durationMinutes, booking.service.type),
  );
  const slots = buildAvailableSlots({
    now,
    durationMinutes: service.durationMinutes,
    rules,
    blockedDays,
    occupied,
  });
  const openDateKeys = buildOpenDateKeys({ now, rules, blockedDays });
  const bookedDays = new Set(slots.map((slot) => slot.dateKey));
  const fullDateKeys = openDateKeys.filter((dateKey) => !bookedDays.has(dateKey));

  return { slots, fullDateKeys };
}
