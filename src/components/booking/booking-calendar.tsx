"use client";

import { useMemo, useState } from "react";
import { WaitlistForm } from "@/components/booking/waitlist-form";
import { MonthCalendar, type CalendarDayTone } from "@/components/calendar/month-calendar";
import { Button } from "@/components/ui/button";
import type { AvailableSlot } from "@/lib/availability";
import { parseDateKey, todayDateKey } from "@/lib/calendar-grid";
import { cn } from "@/lib/utils";

export function BookingCalendar({
  slots,
  fullDateKeys = [],
  serviceId,
  selectedSlot,
  onSelectSlot,
}: {
  slots: AvailableSlot[];
  fullDateKeys?: string[];
  serviceId?: string;
  selectedSlot: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
}) {
  const slotsByDate = useMemo(() => {
    const groups = new Map<string, AvailableSlot[]>();
    for (const slot of slots) {
      const list = groups.get(slot.dateKey) ?? [];
      list.push(slot);
      groups.set(slot.dateKey, list);
    }
    return groups;
  }, [slots]);

  const fullDays = useMemo(() => new Set(fullDateKeys), [fullDateKeys]);
  const firstSlot = slots[0] ?? null;
  const lastSlot = slots[slots.length - 1] ?? null;
  const lastFull = fullDateKeys[fullDateKeys.length - 1];
  const initial = parseDateKey(firstSlot?.dateKey ?? fullDateKeys[0] ?? todayDateKey());
  const [month, setMonth] = useState({ year: initial.year, month: initial.month });
  const [selectedDate, setSelectedDate] = useState<string | null>(firstSlot?.dateKey ?? null);

  const dateSlots = selectedDate ? (slotsByDate.get(selectedDate) ?? []) : [];
  const today = todayDateKey();
  const minMonth = firstSlot ? parseDateKey(firstSlot.dateKey) : fullDateKeys[0] ? parseDateKey(fullDateKeys[0]) : undefined;
  const maxSource = lastSlot?.dateKey && lastFull && lastFull > lastSlot.dateKey ? lastFull : lastSlot?.dateKey ?? lastFull;
  const maxMonth = maxSource ? parseDateKey(maxSource) : undefined;

  function jumpToFirst() {
    if (!firstSlot) {
      return;
    }
    const next = parseDateKey(firstSlot.dateKey);
    setMonth({ year: next.year, month: next.month });
    setSelectedDate(firstSlot.dateKey);
  }

  function dayTone(dateKey: string, inMonth: boolean): CalendarDayTone {
    if (selectedDate === dateKey) {
      return "selected";
    }
    if (slotsByDate.has(dateKey)) {
      return "available";
    }
    if (fullDays.has(dateKey)) {
      return "full";
    }
    if (!inMonth) {
      return "muted";
    }
    return "muted";
  }

  const selectedIsFull = Boolean(selectedDate && fullDays.has(selectedDate) && dateSlots.length === 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Green dots have times. Tinted days are full — you can join the waitlist.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={jumpToFirst} disabled={!firstSlot}>
            First available
          </Button>
        </div>
        <MonthCalendar
          year={month.year}
          month={month.month}
          onMonthChange={(year, nextMonth) => setMonth({ year, month: nextMonth })}
          todayKey={today}
          minMonth={minMonth ? { year: minMonth.year, month: minMonth.month } : undefined}
          maxMonth={maxMonth ? { year: maxMonth.year, month: maxMonth.month } : undefined}
          dayTone={dayTone}
          dayDisabled={(dateKey) => !slotsByDate.has(dateKey) && !fullDays.has(dateKey)}
          dayLabel={(dateKey) => {
            const count = slotsByDate.get(dateKey)?.length ?? 0;
            if (count) {
              return `${dateKey}, ${count} times`;
            }
            if (fullDays.has(dateKey)) {
              return `${dateKey}, full — join waitlist`;
            }
            return `${dateKey}, no times`;
          }}
          onDayClick={(dateKey) => {
            setSelectedDate(dateKey);
            const nextMonth = parseDateKey(dateKey);
            setMonth({ year: nextMonth.year, month: nextMonth.month });
          }}
        />
      </div>
      <div className="rounded-2xl border bg-card p-4">
        {selectedDate && dateSlots.length > 0 ? (
          <>
            <h2 className="font-display text-lg font-semibold">{dateSlots[0].dateLabel}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a start time.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
              {dateSlots.map((slot) => (
                <Button
                  key={slot.startsAt}
                  type="button"
                  variant={selectedSlot?.startsAt === slot.startsAt ? "default" : "outline"}
                  aria-pressed={selectedSlot?.startsAt === slot.startsAt}
                  className={cn(
                    "min-w-[4.75rem]",
                    selectedSlot?.startsAt === slot.startsAt && "ring-2 ring-ring ring-offset-2",
                  )}
                  onClick={() => onSelectSlot(slot)}
                >
                  {slot.label}
                </Button>
              ))}
            </div>
          </>
        ) : selectedIsFull && selectedDate ? (
          <>
            <h2 className="font-display text-lg font-semibold">That day is full</h2>
            <WaitlistForm dateKey={selectedDate} serviceId={serviceId} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a highlighted date to see times, or jump to the first available session.
          </p>
        )}
      </div>
    </div>
  );
}
