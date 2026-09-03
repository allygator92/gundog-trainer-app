"use client";

import { CALENDAR_WEEKDAYS, formatMonthTitle, monthGrid, shiftMonth } from "@/lib/calendar-grid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type CalendarDayTone = "default" | "available" | "muted" | "blocked" | "selected" | "inRange" | "rangeEnd" | "full";

export function MonthCalendar({
  year,
  month,
  onMonthChange,
  todayKey,
  minMonth,
  maxMonth,
  dayTone,
  dayDisabled,
  dayLabel,
  onDayClick,
}: {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  todayKey?: string;
  minMonth?: { year: number; month: number };
  maxMonth?: { year: number; month: number };
  dayTone: (dateKey: string, inMonth: boolean) => CalendarDayTone;
  dayDisabled?: (dateKey: string, inMonth: boolean) => boolean;
  dayLabel?: (dateKey: string) => string | undefined;
  onDayClick: (dateKey: string) => void;
}) {
  const cells = monthGrid(year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const prevDisabled = minMonth
    ? prev.year < minMonth.year || (prev.year === minMonth.year && prev.month < minMonth.month)
    : false;
  const nextDisabled = maxMonth
    ? next.year > maxMonth.year || (next.year === maxMonth.year && next.month > maxMonth.month)
    : false;

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onMonthChange(prev.year, prev.month)}
          disabled={prevDisabled}
          aria-label="Previous month"
        >
          Previous
        </Button>
        <p className="font-display text-lg font-semibold">{formatMonthTitle(year, month)}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onMonthChange(next.year, next.month)}
          disabled={nextDisabled}
          aria-label="Next month"
        >
          Next
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {CALENDAR_WEEKDAYS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label={formatMonthTitle(year, month)}>
        {cells.map((cell) => {
          const tone = dayTone(cell.dateKey, cell.inMonth);
          const disabled = dayDisabled?.(cell.dateKey, cell.inMonth) ?? !cell.inMonth;
          const dayNumber = Number(cell.dateKey.slice(-2));
          const isToday = cell.dateKey === todayKey;

          return (
            <button
              key={cell.dateKey}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={tone === "selected" || tone === "rangeEnd"}
              aria-label={dayLabel?.(cell.dateKey) ?? cell.dateKey}
              onClick={() => onDayClick(cell.dateKey)}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-xl text-sm transition",
                !cell.inMonth && "text-muted-foreground/40",
                tone === "muted" && "text-muted-foreground",
                tone === "available" && "bg-primary/10 font-medium text-foreground hover:bg-primary/20",
                tone === "full" && "bg-accent/30 font-medium text-foreground hover:bg-accent/50",
                tone === "blocked" && "bg-destructive/10 text-destructive line-through",
                tone === "inRange" && "bg-primary/15",
                tone === "selected" && "bg-primary text-primary-foreground hover:bg-primary",
                tone === "rangeEnd" && "bg-primary text-primary-foreground",
                isToday && tone !== "selected" && tone !== "rangeEnd" && "ring-1 ring-primary/50",
                disabled && "cursor-not-allowed hover:bg-transparent",
              )}
            >
              {dayNumber}
              {tone === "available" ? (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              ) : null}
              {tone === "full" ? (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-foreground/50" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
