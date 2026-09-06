"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { createSupportRequestAction } from "@/app/admin/(dashboard)/support/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatSupportKind } from "@/lib/format";
import { SUPPORT_KINDS } from "@/lib/support";

export function SupportRequestForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"kind" | "title" | "body", string>>>({});
  const [result, setResult] = useState<{ message: string; id: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const response = await createSupportRequestAction({
        kind: String(data.get("kind") ?? ""),
        title: String(data.get("title") ?? ""),
        body: String(data.get("body") ?? ""),
      });
      if (!response.ok) {
        setError(response.message);
        setFieldErrors(response.fieldErrors ?? {});
        return;
      }
      setResult({ message: response.message, id: response.id });
      form.reset();
    });
  }

  if (result) {
    return (
      <div className="rounded-xl border bg-card p-6" role="status">
        <h3 className="font-semibold">Request sent</h3>
        <p className="mt-2 text-sm text-muted-foreground">{result.message}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/admin/support/${result.id}`}>View this request</Link>
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setResult(null)}>
            Raise another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h3 className="font-semibold">New request</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Use this for bugs, changes, or something you’d like added. You’ll get a confirmation here, and updates stay on
          this page.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-kind">Type</Label>
        <select
          id="support-kind"
          name="kind"
          required
          defaultValue="bug"
          aria-invalid={Boolean(fieldErrors.kind)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {SUPPORT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {formatSupportKind(kind)}
            </option>
          ))}
        </select>
        {fieldErrors.kind ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.kind}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-title">Title</Label>
        <Input
          id="support-title"
          name="title"
          required
          maxLength={120}
          aria-invalid={Boolean(fieldErrors.title)}
          placeholder="Short summary, for example “Waitlist email not arriving”"
        />
        {fieldErrors.title ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="support-body">Details</Label>
        <Textarea
          id="support-body"
          name="body"
          required
          maxLength={5000}
          aria-invalid={Boolean(fieldErrors.body)}
          placeholder="What happened, what you expected, or what you’d like added."
        />
        {fieldErrors.body ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.body}
          </p>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Sending..." : "Send request"}
      </Button>
    </form>
  );
}
