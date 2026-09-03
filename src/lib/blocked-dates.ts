import { addDaysToDateKey } from "@/lib/calendar-grid";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_BLOCKED_RANGE_DAYS = 62;

export function isDateKey(value: string) {
  return DATE_KEY.test(value);
}

export function eachDateKeyInclusive(start: string, end: string): string[] {
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  const keys: string[] = [];
  let cursor = from;

  while (cursor <= to) {
    keys.push(cursor);
    cursor = addDaysToDateKey(cursor, 1);
    if (keys.length > 366) {
      break;
    }
  }

  return keys;
}

export type BlockedDateRow = {
  id: string;
  dateKey: string;
  dateLabel: string;
  reason: string | null;
};

export type BlockedDateRange = {
  ids: string[];
  startKey: string;
  endKey: string;
  startLabel: string;
  endLabel: string;
  reason: string | null;
};

export function groupBlockedRanges(rows: BlockedDateRow[]): BlockedDateRange[] {
  const sorted = [...rows].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const groups: BlockedDateRange[] = [];

  for (const row of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.reason === row.reason && addDaysToDateKey(last.endKey, 1) === row.dateKey) {
      last.ids.push(row.id);
      last.endKey = row.dateKey;
      last.endLabel = row.dateLabel;
      continue;
    }

    groups.push({
      ids: [row.id],
      startKey: row.dateKey,
      endKey: row.dateKey,
      startLabel: row.dateLabel,
      endLabel: row.dateLabel,
      reason: row.reason,
    });
  }

  return groups;
}
