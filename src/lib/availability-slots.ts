import { addMinutes, eachDayOfInterval, isBefore, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const BOOKING_TIMEZONE = "Europe/London";
export const PENDING_HOLD_MINUTES = 30;
export const DAYS_AHEAD = 14;
export const SLOT_LEAD_MINUTES = 60;

export const WEEKDAYS = [
  { dayOfWeek: 1, label: "Monday" },
  { dayOfWeek: 2, label: "Tuesday" },
  { dayOfWeek: 3, label: "Wednesday" },
  { dayOfWeek: 4, label: "Thursday" },
  { dayOfWeek: 5, label: "Friday" },
  { dayOfWeek: 6, label: "Saturday" },
  { dayOfWeek: 7, label: "Sunday" },
] as const;

export type AvailableSlot = {
  startsAt: string;
  label: string;
  dateLabel: string;
};

export type SlotRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type OccupiedWindow = {
  start: Date;
  end: Date;
};

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

export function londonDay(date: Date) {
  return formatInTimeZone(date, BOOKING_TIMEZONE, "yyyy-MM-dd");
}

export function parseLondon(dateKey: string, time: string) {
  return fromZonedTime(`${dateKey}T${time}:00`, BOOKING_TIMEZONE);
}

export function parseSlotStart(startsAt: string) {
  return parseISO(startsAt);
}

export function buildAvailableSlots(input: {
  now: Date;
  durationMinutes: number;
  rules: SlotRule[];
  blockedDays?: Iterable<string>;
  occupied?: OccupiedWindow[];
  daysAhead?: number;
  leadMinutes?: number;
}): AvailableSlot[] {
  const blockedDays = new Set(input.blockedDays ?? []);
  const occupied = input.occupied ?? [];
  const daysAhead = input.daysAhead ?? DAYS_AHEAD;
  const leadMinutes = input.leadMinutes ?? SLOT_LEAD_MINUTES;

  const rangeStart = parseLondon(londonDay(input.now), "00:00");
  const rangeEnd = addMinutes(rangeStart, daysAhead * 24 * 60);
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const slots: AvailableSlot[] = [];

  for (const day of days) {
    const dateKey = londonDay(day);
    if (blockedDays.has(dateKey)) {
      continue;
    }

    const isoDay = Number(formatInTimeZone(parseLondon(dateKey, "12:00"), BOOKING_TIMEZONE, "i"));
    const dayRules = input.rules.filter((rule) => rule.dayOfWeek === isoDay);
    const dateLabel = formatInTimeZone(parseLondon(dateKey, "12:00"), BOOKING_TIMEZONE, "EEE d MMM");

    for (const rule of dayRules) {
      let cursor = parseLondon(dateKey, rule.startTime);
      const windowEnd = parseLondon(dateKey, rule.endTime);

      while (!isBefore(windowEnd, addMinutes(cursor, input.durationMinutes))) {
        const slotEnd = addMinutes(cursor, input.durationMinutes);
        const tooSoon = isBefore(cursor, addMinutes(input.now, leadMinutes));
        const overlaps = occupied.some((block) => cursor < block.end && slotEnd > block.start);

        if (!tooSoon && !overlaps) {
          slots.push({
            startsAt: cursor.toISOString(),
            label: formatInTimeZone(cursor, BOOKING_TIMEZONE, "HH:mm"),
            dateLabel,
          });
        }

        cursor = addMinutes(cursor, input.durationMinutes);
      }
    }
  }

  return slots;
}
