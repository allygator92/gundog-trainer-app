"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "gundog-cookie-notice";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "dismissed");
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // Ignore private-mode storage failures; the bar will show next visit.
    }
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <>
      <div className="h-28 sm:h-20" aria-hidden="true" />
      <div
        className="site-cookie-notice fixed inset-x-0 bottom-0 z-50 border-t px-4 py-3 shadow-lg"
        role="region"
        aria-label="Cookie notice"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            We use a cookie to remember Heath or Field, and a session cookie if you sign in as admin. We do not use
            advertising cookies.{" "}
            <Link href="/cookies" className="underline underline-offset-2">
              Cookie details
            </Link>
          </p>
          <Button type="button" size="sm" className="site-book shrink-0" onClick={dismiss}>
            Got it
          </Button>
        </div>
      </div>
    </>
  );
}
