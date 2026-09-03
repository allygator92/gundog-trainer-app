import { addMinutes, eachDayOfInterval, isBefore, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const BOOKING_TIMEZONE = "Europe/London";
export const PENDING_HOLD_MINUTES = 30;
export const DAYS_AHEAD = 28;
export const SLOT_LEAD_MINUTES = 60;
export const BUFFER_MINUTES_VIRTUAL = 15;
export const BUFFER_MINUTES_IN_PERSON = 30;
export const DEFAULT_BREAK_START = "12:00";
export const DEFAULT_BREAK_END = "13:00";

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
  dateKey: string;
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

export type DayHours = {
  dayOfWeek: number;
  label: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  hasBreak: boolean;
  breakStartTime: string;
  breakEndTime: string;
};

export function defaultWeeklyHours(
  rules: { dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean }[],
): DayHours[] {
  return WEEKDAYS.map((weekday) => {
    const dayRules = rules
      .filter((item) => item.dayOfWeek === weekday.dayOfWeek && item.isActive !== false)
      .slice()
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (dayRules.length === 0) {
      return {
        dayOfWeek: weekday.dayOfWeek,
        label: weekday.label,
        isActive: false,
        startTime: "09:00",
        endTime: "17:00",
        hasBreak: false,
        breakStartTime: DEFAULT_BREAK_START,
        breakEndTime: DEFAULT_BREAK_END,
      };
    }

    if (dayRules.length === 1) {
      return {
        dayOfWeek: weekday.dayOfWeek,
        label: weekday.label,
        isActive: true,
        startTime: dayRules[0].startTime,
        endTime: dayRules[0].endTime,
        hasBreak: false,
        breakStartTime: DEFAULT_BREAK_START,
        breakEndTime: DEFAULT_BREAK_END,
      };
    }

    return {
      dayOfWeek: weekday.dayOfWeek,
      label: weekday.label,
      isActive: true,
      startTime: dayRules[0].startTime,
      endTime: dayRules[dayRules.length - 1].endTime,
      hasBreak: true,
      breakStartTime: dayRules[0].endTime,
      breakEndTime: dayRules[1].startTime,
    };
  });
}

export function rulesFromDayHours(day: DayHours): SlotRule[] {
  if (!day.isActive) {
    return [];
  }

  if (day.hasBreak) {
    return [
      { dayOfWeek: day.dayOfWeek, startTime: day.startTime, endTime: day.breakStartTime },
      { dayOfWeek: day.dayOfWeek, startTime: day.breakEndTime, endTime: day.endTime },
    ];
  }

  return [{ dayOfWeek: day.dayOfWeek, startTime: day.startTime, endTime: day.endTime }];
}

export function breakHoursError(day: DayHours): string | null {
  if (!day.isActive || !day.hasBreak) {
    return null;
  }

  if (day.startTime >= day.endTime) {
    return `${day.label} needs an end time after the start time.`;
  }
  if (day.breakStartTime >= day.breakEndTime) {
    return `${day.label} break needs to end after it starts.`;
  }
  if (day.breakStartTime <= day.startTime || day.breakEndTime >= day.endTime) {
    return `${day.label} break must sit inside opening hours.`;
  }
  return null;
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

export function sessionBufferMinutes(meetingType: "virtual" | "in_person") {
  return meetingType === "in_person" ? BUFFER_MINUTES_IN_PERSON : BUFFER_MINUTES_VIRTUAL;
}

export function occupiedWindow(
  startsAt: Date,
  durationMinutes: number,
  meetingType: "virtual" | "in_person",
): OccupiedWindow {
  const buffer = sessionBufferMinutes(meetingType);
  return {
    start: addMinutes(startsAt, -buffer),
    end: addMinutes(startsAt, durationMinutes + buffer),
  };
}

export function windowsOverlap(left: OccupiedWindow, right: OccupiedWindow) {
  return left.start < right.end && left.end > right.start;
}

export function buildOpenDateKeys(input: {
  now: Date;
  rules: SlotRule[];
  blockedDays?: Iterable<string>;
  daysAhead?: number;
}): string[] {
  const blockedDays = new Set(input.blockedDays ?? []);
  const daysAhead = input.daysAhead ?? DAYS_AHEAD;
  const rangeStart = parseLondon(londonDay(input.now), "00:00");
  const rangeEnd = addMinutes(rangeStart, daysAhead * 24 * 60);
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const open: string[] = [];

  for (const day of days) {
    const dateKey = londonDay(day);
    if (blockedDays.has(dateKey)) {
      continue;
    }
    const isoDay = Number(formatInTimeZone(parseLondon(dateKey, "12:00"), BOOKING_TIMEZONE, "i"));
    if (input.rules.some((rule) => rule.dayOfWeek === isoDay)) {
      open.push(dateKey);
    }
  }

  return open;
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
            dateKey,
          });
        }

        cursor = addMinutes(cursor, input.durationMinutes);
      }
    }
  }

  return slots;
}
