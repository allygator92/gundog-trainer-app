"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateSupportStatusAction } from "@/app/admin/(dashboard)/support/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatSupportStatus } from "@/lib/format";
import { SUPPORT_STATUSES, type SupportStatus } from "@/lib/support";

export function SupportStatusForm({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: SupportStatus;
}) {
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
      const result = await updateSupportStatusAction({
        requestId,
        status: String(data.get("status") ?? ""),
        notes: String(data.get("notes") ?? ""),
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
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Update status</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Mark it as investigating, ask for more detail, or close it as fixed or implemented. Notes are shown on this
          request.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-status">Status</Label>
        <select
          id="support-status"
          name="status"
          required
          defaultValue={currentStatus}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {SUPPORT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatSupportStatus(status)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-notes">Resolution notes or question</Label>
        <Textarea
          id="support-notes"
          name="notes"
          maxLength={4000}
          placeholder="What changed, how it was fixed, or what extra detail you need."
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
        {pending ? "Saving..." : "Save status"}
      </Button>
    </form>
  );
}
