"use client";

import { useState, useTransition } from "react";
import {
  addBlockedDateAction,
  removeBlockedDateAction,
  saveWeeklyHoursAction,
} from "@/app/admin/(dashboard)/availability/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DayHours = {
  dayOfWeek: number;
  label: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
};

type BlockedDateRow = {
  id: string;
  dateLabel: string;
  reason: string | null;
};

export function AvailabilityManager({
  initialDays,
  blockedDates,
}: {
  initialDays: DayHours[];
  blockedDates: BlockedDateRow[];
}) {
  const [days, setDays] = useState(initialDays);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      }
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

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Weekly hours</h3>
          <p className="text-sm text-muted-foreground">
            Times are in UK time. Empty days stay closed. Slots are offered in the next 14 days.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium">Open</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
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
          <p className="text-sm text-muted-foreground">Use this for holidays or days you cannot take sessions.</p>
        </div>
        <form action={addBlock} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input id="reason" name="reason" placeholder="Holiday" />
          </div>
          <Button type="submit" disabled={pending}>
            Block date
          </Button>
        </form>
        {blockedDates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blocked dates.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {blockedDates.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p>{row.dateLabel}</p>
                  {row.reason ? <p className="text-muted-foreground">{row.reason}</p> : null}
                </div>
                <form action={removeBlock}>
                  <input type="hidden" name="id" value={row.id} />
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
