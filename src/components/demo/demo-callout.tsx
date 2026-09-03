"use client";

import { useState } from "react";
import { demo, STRIPE_TEST_CARD } from "@content/demo";
import { formatCardNumber, isDemoEnabled } from "@/lib/demo";
import { cn } from "@/lib/utils";

export function DemoCallout({
  title,
  children,
  className,
  showTestCard = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  showTestCard?: boolean;
}) {
  if (!isDemoEnabled()) {
    return null;
  }

  return (
    <aside
      className={cn("demo-note rounded-xl border border-dashed px-4 py-3", className)}
      role="note"
    >
      <p className="demo-note-badge text-[0.7rem] font-semibold uppercase tracking-[0.16em]">{demo.badge}</p>
      <p className="mt-1 font-medium">{title}</p>
      <div className="mt-1 space-y-2 text-sm text-muted-foreground">{children}</div>
      {showTestCard ? <DemoTestCard /> : null}
    </aside>
  );
}

export function DemoTestCard() {
  const [copied, setCopied] = useState(false);
  const formatted = formatCardNumber(STRIPE_TEST_CARD);

  async function copy() {
    try {
      await navigator.clipboard.writeText(STRIPE_TEST_CARD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border bg-background/80 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{demo.payment.testCardLabel}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <code className="font-mono text-base tracking-wide text-foreground">{formatted}</code>
        <button
          type="button"
          className="text-xs font-medium underline underline-offset-2"
          onClick={copy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{demo.payment.testCardHint}</p>
    </div>
  );
}
