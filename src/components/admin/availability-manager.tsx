"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addBlockedDateAction,
  removeBlockedDateAction,
  saveWeeklyHoursAction,
} from "@/app/admin/(dashboard)/availability/actions";
import { MonthCalendar, type CalendarDayTone } from "@/components/calendar/month-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DayHours } from "@/lib/availability-slots";
import { groupBlockedRanges, type BlockedDateRow } from "@/lib/blocked-dates";
import { parseDateKey, todayDateKey } from "@/lib/calendar-grid";

export function AvailabilityManager({
  initialDays,
  blockedDates,
}: {
  initialDays: DayHours[];
  blockedDates: BlockedDateRow[];
}) {
  const [days, setDays] = useState(initialDays);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const today = todayDateKey();
  const initialMonth = parseDateKey(today);
  const [month, setMonth] = useState({ year: initialMonth.year, month: initialMonth.month });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const blockedKeys = useMemo(() => new Set(blockedDates.map((row) => row.dateKey)), [blockedDates]);
  const groupedBlocks = useMemo(() => groupBlockedRanges(blockedDates), [blockedDates]);

  function updateDay(dayOfWeek: number, patch: Partial<DayHours>) {
    setDays((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)),
    );
  }

  function saveHours() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await saveWeeklyHoursAction({ days });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Weekly hours saved.");
    });
  }

  function addBlock(formData: FormData) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await addBlockedDateAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRangeStart("");
      setRangeEnd("");
      setMessage(result.added === 1 ? "Date blocked." : `${result.added} dates blocked.`);
    });
  }

  function removeBlock(formData: FormData) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await removeBlockedDateAction(formData);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function selectRangeDay(dateKey: string) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateKey);
      setRangeEnd("");
      return;
    }
    setRangeEnd(dateKey);
  }

  const startKey = rangeStart && rangeEnd && rangeEnd < rangeStart ? rangeEnd : rangeStart;
  const endKey = rangeStart && rangeEnd && rangeEnd < rangeStart ? rangeStart : rangeEnd;

  function dayTone(dateKey: string, inMonth: boolean): CalendarDayTone {
    if (startKey && dateKey === startKey && (!endKey || startKey === endKey)) {
      return "selected";
    }
    if (startKey && endKey && (dateKey === startKey || dateKey === endKey)) {
      return "rangeEnd";
    }
    if (startKey && endKey && dateKey > startKey && dateKey < endKey) {
      return "inRange";
    }
    if (blockedKeys.has(dateKey)) {
      return "blocked";
    }
    if (!inMonth) {
      return "muted";
    }
    return "default";
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Weekly hours</h3>
          <p className="text-sm text-muted-foreground">
            Times are in UK time. Empty days stay closed. A break is protected time that cannot be booked.
            Slots are offered in the next 4 weeks.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium">Open</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Break</th>
                <th className="px-4 py-3 font-medium">Break start</th>
                <th className="px-4 py-3 font-medium">Break end</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.dayOfWeek} className="border-b last:border-0">
                  <td className="px-4 py-3">{day.label}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={day.isActive}
                      onChange={(event) => updateDay(day.dayOfWeek, { isActive: event.target.checked })}
                      aria-label={`Open on ${day.label}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="time"
                      value={day.startTime}
                      onChange={(event) => updateDay(day.dayOfWeek, { startTime: event.target.value })}
                      disabled={!day.isActive}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="time"
                      value={day.endTime}
                      onChange={(event) => updateDay(day.dayOfWeek, { endTime: event.target.value })}
                      disabled={!day.isActive}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={day.hasBreak}
                      onChange={(event) => updateDay(day.dayOfWeek, { hasBreak: event.target.checked })}
                      disabled={!day.isActive}
                      aria-label={`Break on ${day.label}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="time"
                      value={day.breakStartTime}
                      onChange={(event) => updateDay(day.dayOfWeek, { breakStartTime: event.target.value })}
                      disabled={!day.isActive || !day.hasBreak}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="time"
                      value={day.breakEndTime}
                      onChange={(event) => updateDay(day.dayOfWeek, { breakEndTime: event.target.value })}
                      disabled={!day.isActive || !day.hasBreak}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="button" onClick={saveHours} disabled={pending}>
          {pending ? "Saving..." : "Save hours"}
        </Button>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Blocked dates</h3>
          <p className="text-sm text-muted-foreground">
            Click a start date and an end date to block a holiday stretch. A second click on the same day
            blocks just that date.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
          <MonthCalendar
            year={month.year}
            month={month.month}
            onMonthChange={(year, nextMonth) => setMonth({ year, month: nextMonth })}
            todayKey={today}
            dayTone={dayTone}
            dayDisabled={(_dateKey, inMonth) => !inMonth}
            dayLabel={(dateKey) => (blockedKeys.has(dateKey) ? `${dateKey}, already blocked` : dateKey)}
            onDayClick={selectRangeDay}
          />
          <form action={addBlock} className="space-y-4 rounded-2xl border bg-card p-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                value={rangeStart}
                onChange={(event) => {
                  setRangeStart(event.target.value);
                  if (!rangeEnd) {
                    setRangeEnd(event.target.value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
                value={rangeEnd || rangeStart}
                onChange={(event) => setRangeEnd(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input id="reason" name="reason" placeholder="Holiday" />
            </div>
            <Button type="submit" disabled={pending || !rangeStart}>
              {pending ? "Blocking..." : "Block dates"}
            </Button>
          </form>
        </div>
        {groupedBlocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blocked dates.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {groupedBlocks.map((group) => (
              <li key={group.ids.join("-")} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p>
                    {group.startKey === group.endKey
                      ? group.startLabel
                      : `${group.startLabel} – ${group.endLabel}`}
                  </p>
                  {group.reason ? <p className="text-muted-foreground">{group.reason}</p> : null}
                </div>
                <form action={removeBlock}>
                  <input type="hidden" name="ids" value={group.ids.join(",")} />
                  <Button type="submit" variant="ghost" size="sm" disabled={pending}>
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-primary" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
