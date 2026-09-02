"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { submitIntakeAction } from "@/app/actions/intake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  dogSexes,
  formatIntakeAddress,
  intakeFormSchema,
  intakeStepFields,
  skillLevels,
  type IntakeFormInput,
  type IntakeFormValues,
} from "@/lib/validations/intake";

const steps = [
  { id: 1, label: "You" },
  { id: 2, label: "Dog" },
  { id: 3, label: "Behaviour" },
  { id: 4, label: "Review" },
] as const;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

function skillLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function IntakeWizard({
  defaultMeetingType = "virtual",
  lockMeetingType = false,
  onCompleted,
  onCancel,
}: {
  defaultMeetingType?: "virtual" | "in_person";
  lockMeetingType?: boolean;
  onCompleted?: (result: { clientId: string; dogId: string; ownerName: string; dogName: string }) => void;
  onCancel?: () => void;
}) {
  const embedded = Boolean(onCompleted);
  const [step, setStep] = useState<(typeof steps)[number]["id"]>(1);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<IntakeFormInput, unknown, IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      meetingType: defaultMeetingType,
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      dogName: "",
      breed: "",
      ageYears: 1,
      sex: "unknown",
      neutered: false,
      recall: "fair",
      leadWalking: "fair",
      fearTriggers: "",
      aggressionNotes: "",
      previousTraining: "",
      goals: "",
      consentDataStorage: false,
      botField: "",
    },
  });

  const meetingType = form.watch("meetingType");
  const values = form.watch();

  async function goNext() {
    const valid = await form.trigger(intakeStepFields[step] as unknown as (keyof IntakeFormValues)[], {
      shouldFocus: true,
    });
    if (valid) {
      setStep((current) => (current < 4 ? ((current + 1) as 2 | 3 | 4) : current));
    }
  }

  async function onSubmit(data: IntakeFormValues) {
    setServerMessage(null);
    const result = await submitIntakeAction(data);
    if (result.status === "success") {
      if (onCompleted) {
        if (result.clientId && result.dogId) {
          onCompleted({
            clientId: result.clientId,
            dogId: result.dogId,
            ownerName: data.ownerName,
            dogName: data.dogName,
          });
          return;
        }
        setServerMessage("Your intake was saved, but we could not continue to payment. Please try again.");
        return;
      }
      setSuccess(true);
      setServerMessage(result.message ?? "Thanks — your intake has been received.");
      return;
    }
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        if (message) {
          form.setError(field as keyof IntakeFormValues, { message });
        }
      }
      setStep(1);
    }
    setServerMessage(result.message ?? "Something went wrong. Please try again.");
  }

  if (success) {
    return (
      <div className="rounded-xl border bg-card p-6" role="status">
        <h2 className="font-display text-2xl font-semibold">Intake received</h2>
        <p className="mt-2 text-muted-foreground">{serverMessage}</p>
        <Button asChild className="mt-6">
          <Link href="/book">Back to booking</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="relative space-y-8">
      <div className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <input
          id="intake_hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          {...form.register("botField")}
        />
      </div>

      {embedded ? (
        <p className="text-sm text-muted-foreground">
          Intake {step} of 4 · {steps[step - 1].label}
        </p>
      ) : (
        <ol className="grid grid-cols-4 gap-2" aria-label="Intake steps">
          {steps.map((item) => (
            <li key={item.id} className="text-center" aria-current={item.id === step ? "step" : undefined}>
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  item.id <= step ? "bg-primary" : "bg-muted",
                )}
              />
              <p className={cn("mt-2 text-xs", item.id === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                {item.label}
              </p>
            </li>
          ))}
        </ol>
      )}

      {step === 1 ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Your name</Label>
            <Input
              id="ownerName"
              autoComplete="name"
              aria-invalid={Boolean(form.formState.errors.ownerName)}
              aria-describedby={form.formState.errors.ownerName ? "ownerName-error" : undefined}
              {...form.register("ownerName")}
            />
            <FieldError id="ownerName-error" message={form.formState.errors.ownerName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Email</Label>
            <Input
              id="ownerEmail"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.ownerEmail)}
              aria-describedby={form.formState.errors.ownerEmail ? "ownerEmail-error" : undefined}
              {...form.register("ownerEmail")}
            />
            <FieldError id="ownerEmail-error" message={form.formState.errors.ownerEmail?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPhone">Phone (optional)</Label>
            <Input id="ownerPhone" type="tel" autoComplete="tel" {...form.register("ownerPhone")} />
            <FieldError message={form.formState.errors.ownerPhone?.message} />
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Session type</legend>
            {lockMeetingType ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {meetingType === "virtual" ? "Virtual session" : "In-person session"}
                </p>
                <input type="hidden" {...form.register("meetingType")} />
              </>
            ) : (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="virtual" {...form.register("meetingType")} />
                  Virtual
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="in_person" {...form.register("meetingType")} />
                  In person
                </label>
              </>
            )}
          </fieldset>
          {meetingType === "in_person" ? (
            <div className="space-y-5 rounded-lg border bg-card p-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address line 1</Label>
                <Input id="addressLine1" autoComplete="address-line1" {...form.register("addressLine1")} />
                <FieldError message={form.formState.errors.addressLine1?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
                <Input id="addressLine2" autoComplete="address-line2" {...form.register("addressLine2")} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Town or city</Label>
                  <Input id="city" autoComplete="address-level2" {...form.register("city")} />
                  <FieldError message={form.formState.errors.city?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" autoComplete="postal-code" {...form.register("postcode")} />
                  <FieldError message={form.formState.errors.postcode?.message} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="dogName">Dog’s name</Label>
            <Input
              id="dogName"
              aria-invalid={Boolean(form.formState.errors.dogName)}
              aria-describedby={form.formState.errors.dogName ? "dogName-error" : undefined}
              {...form.register("dogName")}
            />
            <FieldError id="dogName-error" message={form.formState.errors.dogName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breed">Breed</Label>
            <Input id="breed" {...form.register("breed")} />
            <FieldError message={form.formState.errors.breed?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageYears">Age (years)</Label>
            <Input id="ageYears" type="number" min={0} max={25} step={0.5} {...form.register("ageYears")} />
            <FieldError message={form.formState.errors.ageYears?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <select id="sex" className={selectClassName} {...form.register("sex")}>
              {dogSexes.map((sex) => (
                <option key={sex} value={sex}>
                  {skillLabel(sex)}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Neutered / spayed</legend>
            <Controller
              control={form.control}
              name="neutered"
              render={({ field }) => (
                <>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    No
                  </label>
                </>
              )}
            />
          </fieldset>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="recall">Recall</Label>
            <select id="recall" className={selectClassName} {...form.register("recall")}>
              {skillLevels.map((level) => (
                <option key={level} value={level}>
                  {skillLabel(level)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadWalking">Lead walking</Label>
            <select id="leadWalking" className={selectClassName} {...form.register("leadWalking")}>
              {skillLevels.map((level) => (
                <option key={level} value={level}>
                  {skillLabel(level)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fearTriggers">Fear or startle triggers</Label>
            <Textarea id="fearTriggers" {...form.register("fearTriggers")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aggressionNotes">Aggression or concern notes</Label>
            <Textarea id="aggressionNotes" {...form.register("aggressionNotes")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="previousTraining">Previous training</Label>
            <Textarea id="previousTraining" {...form.register("previousTraining")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea id="goals" {...form.register("goals")} />
            <FieldError message={form.formState.errors.goals?.message} />
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-5">
          <div className="space-y-3 rounded-xl border bg-card p-5 text-sm">
            <p>
              <span className="font-medium">Owner:</span> {values.ownerName} · {values.ownerEmail}
            </p>
            <p>
              <span className="font-medium">Session:</span>{" "}
              {values.meetingType === "virtual" ? "Virtual" : "In person"}
            </p>
            {values.meetingType === "in_person" ? (
              <p>
                <span className="font-medium">Address:</span> {formatIntakeAddress(values)}
              </p>
            ) : null}
            <p>
              <span className="font-medium">Dog:</span> {values.dogName}, {values.breed}, {values.ageYears} years
            </p>
            <p>
              <span className="font-medium">Goals:</span> {values.goals}
            </p>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1" {...form.register("consentDataStorage")} />
            <span>
              I agree that this information can be stored securely so you can provide training. See the{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                privacy policy
              </Link>
              .
            </span>
          </label>
          <FieldError message={form.formState.errors.consentDataStorage?.message} />
        </div>
      ) : null}

      {serverMessage && !success ? (
        <p className="text-sm text-destructive" role="alert">
          {serverMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep((current) => (current - 1) as 1 | 2 | 3)}>
            Back
          </Button>
        ) : onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Back to times
          </Button>
        ) : (
          <span />
        )}
        {step < 4 ? (
          <Button type="button" onClick={goNext}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={form.formState.isSubmitting || !values.consentDataStorage} aria-busy={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending..." : "Submit intake"}
          </Button>
        )}
      </div>
    </form>
  );
}
