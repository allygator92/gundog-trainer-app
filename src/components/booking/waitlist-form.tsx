"use client";

import { type FormEvent, useState, useTransition } from "react";
import { joinWaitlistAction } from "@/app/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateKeyLong } from "@/lib/calendar-grid";

export function WaitlistForm({
  dateKey,
  serviceId,
}: {
  dateKey: string;
  serviceId?: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await joinWaitlistAction({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        dateKey,
        serviceId,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "You’re on the waitlist.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        {formatDateKeyLong(dateKey)} is full. Leave your details and we’ll email you if a time opens.
      </p>
      <div className="space-y-2">
        <Label htmlFor="waitlist-name">Name</Label>
        <Input id="waitlist-name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="waitlist-email">Email</Label>
        <Input id="waitlist-email" name="email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Joining..." : "Join waitlist"}
      </Button>
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
    </form>
  );
}
