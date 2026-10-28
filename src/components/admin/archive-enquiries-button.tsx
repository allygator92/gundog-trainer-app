"use client";

import { useState, useTransition } from "react";
import { archiveAllEnquiriesAction } from "@/app/admin/(dashboard)/enquiries/actions";
import { Button } from "@/components/ui/button";

export function ArchiveEnquiriesButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function archiveAll() {
    if (!window.confirm("Archive every open enquiry? You can restore them from Archived.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await archiveAllEnquiriesAction();
      } catch {
        setError("Those enquiries could not be archived.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={archiveAll} disabled={pending}>
        {pending ? "Archiving…" : "Archive all"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
