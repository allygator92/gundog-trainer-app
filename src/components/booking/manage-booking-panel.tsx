"use client";

import { useState, useTransition } from "react";
import { cancelManagedBookingAction, rescheduleManagedBookingAction } from "@/app/actions/manage-booking";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { Button } from "@/components/ui/button";
import type { AvailableSlot } from "@/lib/availability";
import { canReschedule, MANAGE_NOTICE_HOURS } from "@/lib/booking-manage";

export function ManageBookingPanel({
  token,
  whenLabel,
  canMove,
  startsAtIso,
  slots,
  fullDateKeys,
}: {
  token: string;
  whenLabel: string;
  canMove: boolean;
  startsAtIso: string;
  slots: AvailableSlot[];
  fullDateKeys: string[];
}) {
  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const stillMoveable = canReschedule(new Date(startsAtIso));

  function cancel() {
    if (!window.confirm("Cancel this session? The time will go back on the diary.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await cancelManagedBookingAction(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("This session is cancelled. You can book again any time.");
    });
  }

  function reschedule() {
    if (!slot) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rescheduleManagedBookingAction(token, slot.startsAt);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(`Moved to ${slot.dateLabel} at ${slot.label}.`);
    });
  }

  if (message) {
    return (
      <p className="rounded-xl border bg-card p-4 text-sm" role="status">
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-4 text-sm">
        <p>
          Currently booked for <span className="font-medium">{whenLabel}</span>.
        </p>
        <p className="mt-2 text-muted-foreground">
          Please give {MANAGE_NOTICE_HOURS} hours’ notice where you can. Cancelling with less notice still frees the
          diary; refunds are at the trainer’s discretion.
        </p>
        <Button type="button" variant="destructive" className="mt-4" onClick={cancel} disabled={pending}>
          Cancel this session
        </Button>
      </div>

      {canMove && stillMoveable ? (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Reschedule</h2>
          <BookingCalendar slots={slots} fullDateKeys={fullDateKeys} selectedSlot={slot} onSelectSlot={setSlot} />
          <Button type="button" onClick={reschedule} disabled={!slot || pending}>
            {pending ? "Saving..." : "Save new time"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          It’s too close to the session to pick a new time here. Cancel if you need to, then get in touch.
        </p>
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
