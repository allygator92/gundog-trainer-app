"use client";

import { useState, useTransition, type FormEvent } from "react";
import { uploadClientDocumentAction } from "@/app/admin/(dashboard)/documents/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DocumentUploadForm({
  clients,
  defaultClientId,
}: {
  clients: { id: string; name: string }[];
  defaultClientId?: string;
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
      const result = await uploadClientDocumentAction(data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("File stored privately.");
      form.reset();
    });
  }

  if (clients.length === 0) {
    return <p className="text-sm text-muted-foreground">Add a client via an intake before uploading files.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="clientId">Client</Label>
        <select
          id="clientId"
          name="clientId"
          defaultValue={defaultClientId}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">PDF or image</Label>
        <Input id="file" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
        <p className="text-xs text-muted-foreground">Private to admin. Maximum 10 MB.</p>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}
