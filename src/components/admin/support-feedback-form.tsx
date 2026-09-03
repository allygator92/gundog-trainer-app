"use client";

import { useState, useTransition, type FormEvent } from "react";
import { addSupportFeedbackAction } from "@/app/admin/(dashboard)/support/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SupportFeedbackForm({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await addSupportFeedbackAction({
        requestId,
        body: String(data.get("body") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(result.message);
      form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="support-feedback">Add more detail</Label>
        <Textarea
          id="support-feedback"
          name="body"
          required
          maxLength={4000}
          placeholder="Screenshots described in words, the date it happened, or anything else that helps."
        />
      </div>
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
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Sending..." : "Send extra detail"}
      </Button>
    </form>
  );
}
