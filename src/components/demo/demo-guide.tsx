"use client";

import { useEffect, useId, useState } from "react";
import { demo } from "@content/demo";
import { DemoTestCard } from "@/components/demo/demo-callout";
import { Button } from "@/components/ui/button";
import { DEMO_WELCOME_KEY, isDemoEnabled } from "@/lib/demo";

export function DemoGuide() {
  const titleId = useId();
  const [ready, setReady] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!isDemoEnabled()) {
      return;
    }
    try {
      setWelcomeOpen(window.localStorage.getItem(DEMO_WELCOME_KEY) !== "dismissed");
    } catch {
      setWelcomeOpen(true);
    }
    setReady(true);
  }, []);

  function dismissWelcome() {
    try {
      window.localStorage.setItem(DEMO_WELCOME_KEY, "dismissed");
    } catch {
      // Private mode: the dialog will show again next visit.
    }
    setWelcomeOpen(false);
  }

  useEffect(() => {
    if (!welcomeOpen && !panelOpen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (welcomeOpen) {
          dismissWelcome();
        } else {
          setPanelOpen(false);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [welcomeOpen, panelOpen]);

  if (!isDemoEnabled() || !ready) {
    return null;
  }

  return (
    <>
      {welcomeOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="demo-note max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 shadow-xl sm:p-6"
          >
            <p className="demo-note-badge text-[0.7rem] font-semibold uppercase tracking-[0.16em]">{demo.badge}</p>
            <h2 id={titleId} className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {demo.welcome.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{demo.welcome.intro}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {demo.welcome.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-5 flex justify-end">
              <Button type="button" className="site-book" onClick={dismissWelcome}>
                {demo.welcome.continueLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed bottom-24 right-4 z-40 sm:bottom-6">
        {panelOpen ? (
          <div
            role="dialog"
            aria-label={demo.launcherLabel}
            className="demo-note pointer-events-auto mb-3 max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border bg-card p-4 shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="demo-note-badge text-[0.7rem] font-semibold uppercase tracking-[0.16em]">{demo.badge}</p>
                <h2 className="mt-1 font-display text-lg font-semibold">{demo.launcherLabel}</h2>
              </div>
              <button type="button" className="text-sm text-muted-foreground underline underline-offset-2" onClick={() => setPanelOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <section>
                <h3 className="font-medium">{demo.payment.title}</h3>
                <p className="mt-1 text-muted-foreground">{demo.payment.body}</p>
                <DemoTestCard />
                <p className="mt-2 text-muted-foreground">{demo.payment.afterPay}</p>
              </section>
              <section>
                <h3 className="font-medium">{demo.contact.title}</h3>
                <p className="mt-1 text-muted-foreground">{demo.contact.body}</p>
              </section>
              <section>
                <h3 className="font-medium">{demo.about.title}</h3>
                <p className="mt-1 text-muted-foreground">{demo.about.body}</p>
              </section>
              <section>
                <h3 className="font-medium">{demo.admin.title}</h3>
                <p className="mt-1 text-muted-foreground">{demo.admin.body}</p>
              </section>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          className="pointer-events-auto demo-note inline-flex min-h-10 items-center rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide shadow-md"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((open) => !open)}
        >
          {panelOpen ? "Hide sample notes" : demo.launcherLabel}
        </button>
      </div>
    </>
  );
}
