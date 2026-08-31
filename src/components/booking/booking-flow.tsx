"use client";

import { useMemo, useState, useTransition } from "react";
import { createCheckoutAction, getSlotsAction } from "@/app/actions/booking";
import { IntakeWizard } from "@/components/forms/intake-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@content/site";
import type { AvailableSlot } from "@/lib/availability";
import { formatDuration, formatPricePence, formatServiceType } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BookableService = {
  id: string;
  name: string;
  type: "virtual" | "in_person";
  durationMinutes: number;
  pricePence: number;
  description: string | null;
};

const steps = ["Session", "Time", "Intake", "Pay"] as const;

type BookingState = {
  service: BookableService | null;
  slot: AvailableSlot | null;
  clientId: string | null;
  dogId: string | null;
  ownerName: string | null;
  dogName: string | null;
};

export function BookingFlow({
  services,
  cancelled,
}: {
  services: BookableService[];
  cancelled?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<BookingState>({
    service: null,
    slot: null,
    clientId: null,
    dogId: null,
    ownerName: null,
    dogName: null,
  });
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [error, setError] = useState<string | null>(cancelled ? "Payment was cancelled. You can pick a time again." : null);
  const [pending, startTransition] = useTransition();

  const slotsByDate = useMemo(() => {
    const groups = new Map<string, AvailableSlot[]>();
    for (const slot of slots) {
      const list = groups.get(slot.dateLabel) ?? [];
      list.push(slot);
      groups.set(slot.dateLabel, list);
    }
    return [...groups.entries()];
  }, [slots]);

  function selectService(service: BookableService) {
    setError(null);
    setState({
      service,
      slot: null,
      clientId: null,
      dogId: null,
      ownerName: null,
      dogName: null,
    });
    startTransition(async () => {
      const nextSlots = await getSlotsAction(service.id);
      setSlots(nextSlots);
      setStep(1);
    });
  }

  function pay() {
    if (!state.service || !state.slot || !state.clientId || !state.dogId) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutAction({
        serviceId: state.service!.id,
        startsAt: state.slot!.startsAt,
        clientId: state.clientId!,
        dogId: state.dogId!,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <div className="space-y-8">
      <ol className="grid grid-cols-4 gap-2">
        {steps.map((label, index) => (
          <li key={label} className="text-center">
            <div className={cn("h-1.5 rounded-full", index <= step ? "bg-primary" : "bg-muted")} />
            <p className={cn("mt-2 text-xs", index === step ? "font-medium" : "text-muted-foreground")}>{label}</p>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className="text-left disabled:opacity-70"
              onClick={() => selectService(service)}
              disabled={pending}
            >
              <Card className="h-full transition hover:border-primary">
                <CardHeader>
                  <p className="text-xs font-medium uppercase tracking-widest text-primary">
                    {formatServiceType(service.type)}
                  </p>
                  <CardTitle className="font-display text-2xl">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold">{formatPricePence(service.pricePence)}</p>
                  <p className="text-sm text-muted-foreground">{formatDuration(service.durationMinutes)}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-6">
          {pending && slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading times…</p>
          ) : null}
          {slots.length === 0 && !pending ? (
            <p className="text-sm text-muted-foreground">No times in the next two weeks. Try the other session type, or get in touch.</p>
          ) : null}
          {slotsByDate.map(([dateLabel, dateSlots]) => (
            <div key={dateLabel}>
              <h2 className="font-display text-lg font-semibold">{dateLabel}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {dateSlots.map((slot) => (
                  <Button
                    key={slot.startsAt}
                    type="button"
                    variant={state.slot?.startsAt === slot.startsAt ? "default" : "outline"}
                    onClick={() => setState((current) => ({ ...current, slot }))}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="button" disabled={!state.slot} onClick={() => setStep(2)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 && state.service ? (
        <div className="space-y-4">
          <IntakeWizard
            defaultMeetingType={state.service.type}
            lockMeetingType
            onCompleted={({ clientId, dogId, ownerName, dogName }) => {
              setState((current) => ({ ...current, clientId, dogId, ownerName, dogName }));
              setStep(3);
            }}
          />
          <Button type="button" variant="outline" onClick={() => setStep(1)}>
            Back to times
          </Button>
        </div>
      ) : null}

      {step === 3 && state.service && state.slot ? (
        <div className="space-y-5 rounded-xl border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Review and pay</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Session</dt>
              <dd>{state.service.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">When</dt>
              <dd>
                {state.slot.dateLabel} at {state.slot.label}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Dog</dt>
              <dd>{state.dogName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">You</dt>
              <dd>{state.ownerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-semibold">{formatPricePence(state.service.pricePence)}</dd>
            </div>
          </dl>
          {state.service.type === "virtual" ? (
            <p className="text-sm text-muted-foreground">{site.virtualMeetingNote}</p>
          ) : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" onClick={pay} disabled={pending}>
              {pending ? "Starting checkout..." : "Pay securely"}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
