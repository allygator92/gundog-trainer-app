export const CALENDAR_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type CalendarCell = {
  dateKey: string;
  inMonth: boolean;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function dateKeyFromParts(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const { year, month, day } = parseDateKey(dateKey);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return dateKeyFromParts(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
}

export function monthGrid(year: number, month: number): CalendarCell[] {
  const firstKey = dateKeyFromParts(year, month, 1);
  const weekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leading = (weekday + 6) % 7;
  const start = addDaysToDateKey(firstKey, -leading);

  return Array.from({ length: 42 }, (_, index) => {
    const dateKey = addDaysToDateKey(start, index);
    return { dateKey, inMonth: parseDateKey(dateKey).month === month };
  });
}

export function shiftMonth(year: number, month: number, delta: number) {
  const next = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 };
}

export function formatMonthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

export function formatDateKeyLong(dateKey: string) {
  const { year, month, day } = parseDateKey(dateKey);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function todayDateKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(now);
}
