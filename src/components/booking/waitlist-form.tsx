"use client";

import { type FormEvent, useState, useTransition } from "react";
import { joinWaitlistAction } from "@/app/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateKeyLong } from "@/lib/calendar-grid";
import { waitlistSchema } from "@/lib/validations/waitlist";

export function WaitlistForm({
  dateKey,
  serviceId,
}: {
  dateKey: string;
  serviceId?: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    setMessage(null);
    setError(null);
    const parsed = waitlistSchema.safeParse({ name, email, dateKey, serviceId });
    if (!parsed.success) {
      const next: { name?: string; email?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === "name" || key === "email") && !next[key]) {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    startTransition(async () => {
      const result = await joinWaitlistAction({
        name: parsed.data.name,
        email: parsed.data.email,
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
    <form noValidate onSubmit={onSubmit} className="mt-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        {formatDateKeyLong(dateKey)} is full. Leave your details and we’ll email you if a time opens.
      </p>
      <div className="space-y-2">
        <Label htmlFor="waitlist-name">Name</Label>
        <Input
          id="waitlist-name"
          name="name"
          required
          autoComplete="name"
          maxLength={60}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "waitlist-name-error" : undefined}
        />
        {fieldErrors.name ? (
          <p id="waitlist-name-error" className="text-sm text-destructive" role="alert">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="waitlist-email">Email</Label>
        <Input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={120}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "waitlist-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p id="waitlist-email-error" className="text-sm text-destructive" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
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
