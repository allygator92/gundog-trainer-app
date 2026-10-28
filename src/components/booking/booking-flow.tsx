"use client";

import { useEffect, useState, useTransition } from "react";
import { createCheckoutAction, getSlotsAction } from "@/app/actions/booking";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { DemoCallout } from "@/components/demo/demo-callout";
import { IntakeWizard } from "@/components/forms/intake-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demo } from "@content/demo";
import { site } from "@content/site";
import { trackClientEvent } from "@/lib/analytics-client";
import { clearBookingDraft, readBookingDraft, saveBookingDraft } from "@/lib/booking-draft";
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
  const [fullDateKeys, setFullDateKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!cancelled) return;
    const draft = readBookingDraft();
    const service = draft ? services.find((item) => item.id === draft.serviceId) : undefined;
    if (!draft || !service) {
      setNotice("Payment was not completed. You can pick a time again.");
      return;
    }
    setState({
      service,
      slot: {
        startsAt: draft.startsAt,
        dateLabel: draft.dateLabel,
        dateKey: draft.dateKey,
        label: draft.label,
      },
      clientId: draft.clientId,
      dogId: draft.dogId,
      ownerName: draft.ownerName,
      dogName: draft.dogName,
    });
    setStep(3);
    setResumed(true);
    setNotice("Payment was not completed. Your details are still here. You can pay again, or start again.");
  }, [cancelled, services]);

  function startAgain() {
    clearBookingDraft();
    setResumed(false);
    setNotice(null);
    setError(null);
    setState({
      service: null,
      slot: null,
      clientId: null,
      dogId: null,
      ownerName: null,
      dogName: null,
    });
    setStep(0);
  }

  function selectService(service: BookableService) {
    setError(null);
    trackClientEvent("booking_service_selected", { label: service.name });
    setState({
      service,
      slot: null,
      clientId: null,
      dogId: null,
      ownerName: null,
      dogName: null,
    });
    startTransition(async () => {
      const next = await getSlotsAction(service.id);
      setSlots(next.slots);
      setFullDateKeys(next.fullDateKeys);
      setStep(1);
    });
  }

  function pay() {
    const service = state.service;
    const slot = state.slot;
    const clientId = state.clientId;
    const dogId = state.dogId;
    if (!service || !slot || !clientId || !dogId) {
      return;
    }
    setError(null);
    trackClientEvent("checkout_clicked");
    startTransition(async () => {
      const result = await createCheckoutAction({
        serviceId: service.id,
        startsAt: slot.startsAt,
        clientId,
        dogId,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      saveBookingDraft({
        serviceId: service.id,
        startsAt: slot.startsAt,
        dateLabel: slot.dateLabel,
        dateKey: slot.dateKey,
        label: slot.label,
        clientId,
        dogId,
        ownerName: state.ownerName ?? "",
        dogName: state.dogName ?? "",
      });
      window.location.href = result.url;
    });
  }

  return (
    <div className="space-y-8">
      <ol className="grid grid-cols-4 gap-2" aria-label="Booking steps">
        {steps.map((label, index) => (
          <li key={label} className="text-center" aria-current={index === step ? "step" : undefined}>
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
              className="group text-left disabled:opacity-70"
              onClick={() => selectService(service)}
              disabled={pending}
            >
              <Card className="h-full border-2 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:translate-y-0 active:scale-[0.99] group-focus-visible:border-primary group-focus-visible:ring-2 group-focus-visible:ring-ring">
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
            <p className="text-sm text-muted-foreground">
              No times in the next four weeks. Join a waitlist on a full day, try the other session type, or get in
              touch.
            </p>
          ) : null}
          {slots.length > 0 || fullDateKeys.length > 0 ? (
            <BookingCalendar
              slots={slots}
              fullDateKeys={fullDateKeys}
              serviceId={state.service?.id}
              selectedSlot={state.slot}
              onSelectSlot={(slot) => {
                trackClientEvent("booking_slot_selected", { label: `${slot.dateLabel} ${slot.label}` });
                setState((current) => ({ ...current, slot }));
              }}
            />
          ) : null}
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
            onCancel={() => setStep(1)}
            onCompleted={({ clientId, dogId, ownerName, dogName }) => {
              trackClientEvent("intake_completed");
              setState((current) => ({ ...current, clientId, dogId, ownerName, dogName }));
              setStep(3);
            }}
          />
        </div>
      ) : null}

      {step === 3 && state.service && state.slot ? (
        <div className="space-y-5 rounded-xl border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Review and pay</h2>
          <DemoCallout title={demo.payment.title} showTestCard>
            <p>{demo.payment.body}</p>
            <p>{demo.payment.afterPay}</p>
          </DemoCallout>
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
            {resumed ? (
              <Button type="button" variant="outline" onClick={startAgain}>
                Start again
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
            )}
            <Button type="button" onClick={pay} disabled={pending} aria-busy={pending}>
              {pending ? "Starting checkout..." : "Pay securely"}
            </Button>
          </div>
        </div>
      ) : null}

      {notice ? (
        <p className="text-sm text-muted-foreground" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
