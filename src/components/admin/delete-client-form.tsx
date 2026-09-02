"use client";

import { useState } from "react";
import { deleteClientAction } from "@/app/admin/(dashboard)/clients/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteClientForm({
  clientId,
  clientName,
  error,
}: {
  clientId: string;
  clientName: string;
  error?: string;
}) {
  const [open, setOpen] = useState(Boolean(error));

  if (!open) {
    return (
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Delete client data
      </Button>
    );
  }

  return (
    <form action={deleteClientAction} className="space-y-3 rounded-xl border border-destructive/40 bg-card p-4">
      <input type="hidden" name="clientId" value={clientId} />
      <p className="text-sm">
        This removes {clientName}, their dogs, bookings, and private files from this app. Stripe may still hold payment
        records. Type the client’s name to confirm.
      </p>
      <div className="space-y-2">
        <Label htmlFor="confirmName">Client name</Label>
        <Input id="confirmName" name="confirmName" autoComplete="off" required />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="destructive">
          Permanently delete
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Keep record
        </Button>
      </div>
    </form>
  );
}
