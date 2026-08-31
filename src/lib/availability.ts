import { addMinutes, eachDayOfInterval, isBefore, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

export const BOOKING_TIMEZONE = "Europe/London";
export const PENDING_HOLD_MINUTES = 30;
const DAYS_AHEAD = 14;

export const WEEKDAYS = [
  { dayOfWeek: 1, label: "Monday" },
  { dayOfWeek: 2, label: "Tuesday" },
  { dayOfWeek: 3, label: "Wednesday" },
  { dayOfWeek: 4, label: "Thursday" },
  { dayOfWeek: 5, label: "Friday" },
  { dayOfWeek: 6, label: "Saturday" },
  { dayOfWeek: 7, label: "Sunday" },
] as const;

export function defaultWeeklyHours(
  rules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[],
) {
  return WEEKDAYS.map((weekday) => {
    const rule = rules.find((item) => item.dayOfWeek === weekday.dayOfWeek);
    return {
      dayOfWeek: weekday.dayOfWeek,
      label: weekday.label,
      isActive: Boolean(rule?.isActive),
      startTime: rule?.startTime ?? "09:00",
      endTime: rule?.endTime ?? "17:00",
    };
  });
}

export type AvailableSlot = {
  startsAt: string;
  label: string;
  dateLabel: string;
};

function londonDay(date: Date) {
  return formatInTimeZone(date, BOOKING_TIMEZONE, "yyyy-MM-dd");
}

function parseLondon(dateKey: string, time: string) {
  return fromZonedTime(`${dateKey}T${time}:00`, BOOKING_TIMEZONE);
}

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

  const blockedDays = new Set(blocked.map((row) => londonDay(row.date)));
  const occupied = bookings.map((booking) => ({
    start: booking.startsAt,
    end: addMinutes(booking.startsAt, booking.service.durationMinutes),
  }));

  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const slots: AvailableSlot[] = [];

  for (const day of days) {
    const dateKey = londonDay(day);
    if (blockedDays.has(dateKey)) {
      continue;
    }

    const isoDay = Number(formatInTimeZone(parseLondon(dateKey, "12:00"), BOOKING_TIMEZONE, "i"));
    const dayRules = rules.filter((rule) => rule.dayOfWeek === isoDay);
    const dateLabel = formatInTimeZone(parseLondon(dateKey, "12:00"), BOOKING_TIMEZONE, "EEE d MMM");

    for (const rule of dayRules) {
      let cursor = parseLondon(dateKey, rule.startTime);
      const windowEnd = parseLondon(dateKey, rule.endTime);

      while (!isBefore(windowEnd, addMinutes(cursor, service.durationMinutes))) {
        const slotEnd = addMinutes(cursor, service.durationMinutes);
        const tooSoon = isBefore(cursor, addMinutes(now, 60));
        const overlaps = occupied.some((block) => cursor < block.end && slotEnd > block.start);

        if (!tooSoon && !overlaps) {
          slots.push({
            startsAt: cursor.toISOString(),
            label: formatInTimeZone(cursor, BOOKING_TIMEZONE, "HH:mm"),
            dateLabel,
          });
        }

        cursor = addMinutes(cursor, service.durationMinutes);
      }
    }
  }

  return slots;
}

export function parseSlotStart(startsAt: string) {
  return parseISO(startsAt);
}
