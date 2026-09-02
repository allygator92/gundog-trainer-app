"use client";

import { useState, useTransition } from "react";
import { cancelBookingAction } from "@/app/admin/(dashboard)/bookings/actions";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function cancel() {
    if (!window.confirm("Cancel this booking and free the slot?")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="destructive" onClick={cancel} disabled={pending}>
        {pending ? "Cancelling…" : "Cancel booking"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
