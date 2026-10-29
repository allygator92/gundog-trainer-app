"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { lookupDogsByEmailAction, submitIntakeAction } from "@/app/actions/intake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  dogJobLabels,
  dogJobs,
  dogSexes,
  formatDogAge,
  formatIntakeAddress,
  groundHint,
  groundLabels,
  groundOptions,
  intakeFormSchema,
  intakeStepFields,
  shotSteadyLabels,
  shotSteadyStates,
  startedLabels,
  startedStates,
  steadyLabels,
  steadyStates,
  type IntakeFormInput,
  type IntakeFormValues,
} from "@/lib/validations/intake";

const steps = [
  { id: 1, label: "You" },
  { id: 2, label: "Dog" },
  { id: 3, label: "Job" },
  { id: 4, label: "Review" },
] as const;

function stepForField(field: string): (typeof steps)[number]["id"] {
  for (const item of steps) {
    if ((intakeStepFields[item.id] as readonly string[]).includes(field)) {
      return item.id;
    }
  }
  return 1;
}

function earliestStep(fields: string[]): (typeof steps)[number]["id"] {
  let earliest: (typeof steps)[number]["id"] = 4;
  for (const field of fields) {
    const stepId = stepForField(field);
    if (stepId < earliest) {
      earliest = stepId;
    }
  }
  return earliest;
}

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

function ChoiceField<T extends string>({
  id,
  label,
  hint,
  options,
  labels,
  register,
  error,
}: {
  id: string;
  label: string;
  hint?: string;
  options: readonly T[];
  labels: Record<T, string>;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <select id={id} className={selectClassName} {...register}>
        <option value="">Choose</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

function choiceLine(title: string, value: string | undefined, labels: Record<string, string>) {
  if (!value || !(value in labels)) {
    return null;
  }
  return (
    <p>
      <span className="font-medium">{title}:</span> {labels[value]}
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
  const [existingDogs, setExistingDogs] = useState<{ id: string; name: string; breed: string | null; age: string | null }[]>(
    [],
  );
  const [addingNewDog, setAddingNewDog] = useState(false);

  const form = useForm<IntakeFormInput, unknown, IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    mode: "onTouched",
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
      ageMonths: "",
      sex: "unknown",
      neutered: false,
      dogJob: "",
      dummyWork: "",
      whistle: "",
      steadyBirds: "",
      steadyDogs: "",
      steadyShot: "",
      hasGround: "",
      groundNotes: "",
      fearTriggers: "",
      aggressionNotes: "",
      previousTraining: "",
      extraNotes: "",
      goals: "",
      consentDataStorage: false,
      existingDogId: undefined,
      botField: "",
    },
  });

  const meetingType = useWatch({ control: form.control, name: "meetingType" });
  const values = useWatch({ control: form.control });

  function onInvalid(errors: FieldErrors<IntakeFormInput>) {
    const fields = Object.keys(errors);
    if (fields.length > 0) {
      setStep(earliestStep(fields));
    }
    setServerMessage("Please check the highlighted fields.");
  }

  async function goNext() {
    setServerMessage(null);
    const valid = await form.trigger(intakeStepFields[step] as unknown as (keyof IntakeFormValues)[], {
      shouldFocus: true,
    });
    if (!valid) {
      return;
    }
    if (step === 1) {
      const dogs = await lookupDogsByEmailAction(form.getValues("ownerEmail"));
      setExistingDogs(dogs);
      setAddingNewDog(dogs.length === 0);
    }
    setStep((current) => (current < 4 ? ((current + 1) as 2 | 3 | 4) : current));
  }

  function chooseExistingDog(dog: { id: string; name: string; breed: string | null; age: string | null }) {
    form.setValue("existingDogId", dog.id);
    form.setValue("dogName", dog.name);
    form.setValue("breed", dog.breed || "Unknown");
    form.setValue("ageYears", Number.parseFloat(dog.age ?? "1") || 1);
    if (!form.getValues("goals")) {
      form.setValue("goals", "Returning client - see previous intake.");
    }
    setStep(4);
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
      setServerMessage(result.message ?? "Thanks - your intake has been received.");
      return;
    }
    if (result.fieldErrors) {
      const fields = Object.entries(result.fieldErrors).filter((entry): entry is [string, string] => Boolean(entry[1]));
      for (const [field, message] of fields) {
        form.setError(field as keyof IntakeFormValues, { message });
      }
      if (fields.length > 0) {
        setStep(earliestStep(fields.map(([field]) => field)));
      }
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
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (step < 4) {
          void goNext();
          return;
        }
        void form.handleSubmit(onSubmit, onInvalid)(event);
      }}
      className="relative space-y-8"
    >
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
              maxLength={60}
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
              maxLength={120}
              inputMode="email"
              aria-invalid={Boolean(form.formState.errors.ownerEmail)}
              aria-describedby={form.formState.errors.ownerEmail ? "ownerEmail-error" : undefined}
              {...form.register("ownerEmail")}
            />
            <FieldError id="ownerEmail-error" message={form.formState.errors.ownerEmail?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPhone">Phone (optional)</Label>
            <Input id="ownerPhone" type="tel" autoComplete="tel" maxLength={20} inputMode="tel" {...form.register("ownerPhone")} />
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
                <Input id="addressLine1" autoComplete="address-line1" maxLength={100} {...form.register("addressLine1")} />
                <FieldError message={form.formState.errors.addressLine1?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
                <Input id="addressLine2" autoComplete="address-line2" maxLength={100} {...form.register("addressLine2")} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Town or city</Label>
                  <Input id="city" autoComplete="address-level2" maxLength={60} {...form.register("city")} />
                  <FieldError message={form.formState.errors.city?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" autoComplete="postal-code" maxLength={10} {...form.register("postcode")} />
                  <FieldError message={form.formState.errors.postcode?.message} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          {existingDogs.length > 0 && !addingNewDog ? (
            <div className="space-y-3 rounded-xl border bg-card p-4">
              <p className="text-sm font-medium">Welcome back. Book with a dog we already know?</p>
              <ul className="space-y-2">
                {existingDogs.map((dog) => (
                  <li key={dog.id}>
                    <Button type="button" variant="outline" className="w-full justify-start" onClick={() => chooseExistingDog(dog)}>
                      {dog.name}
                      {dog.breed ? ` · ${dog.breed}` : ""}
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.setValue("existingDogId", undefined);
                  setAddingNewDog(true);
                }}
              >
                Add another dog
              </Button>
            </div>
          ) : (
            <>
          <div className="space-y-2">
            <Label htmlFor="dogName">Dog’s name</Label>
            <Input
              id="dogName"
              maxLength={40}
              aria-invalid={Boolean(form.formState.errors.dogName)}
              aria-describedby={form.formState.errors.dogName ? "dogName-error" : undefined}
              {...form.register("dogName")}
            />
            <FieldError id="dogName-error" message={form.formState.errors.dogName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breed">Breed</Label>
            <Input id="breed" maxLength={40} {...form.register("breed")} />
            <FieldError message={form.formState.errors.breed?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageYears">Age (years)</Label>
            <Input
              id="ageYears"
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              aria-invalid={Boolean(form.formState.errors.ageYears)}
              aria-describedby={form.formState.errors.ageYears ? "ageYears-error" : undefined}
              {...form.register("ageYears")}
            />
            <FieldError id="ageYears-error" message={form.formState.errors.ageYears?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageMonths">Age in months, if under a year</Label>
            <Input
              id="ageMonths"
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              aria-invalid={Boolean(form.formState.errors.ageMonths)}
              aria-describedby={form.formState.errors.ageMonths ? "ageMonths-error" : undefined}
              {...form.register("ageMonths")}
            />
            <p className="text-sm text-muted-foreground">Put 0 in years, then the months here. One month is shown as 1 month.</p>
            <FieldError id="ageMonths-error" message={form.formState.errors.ageMonths?.message} />
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
            </>
          )}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5">
          <ChoiceField
            id="dogJob"
            label="What is this dog for?"
            options={dogJobs}
            labels={dogJobLabels}
            register={form.register("dogJob")}
            error={form.formState.errors.dogJob?.message}
          />
          <ChoiceField
            id="dummyWork"
            label="Dummy work"
            options={startedStates}
            labels={startedLabels}
            register={form.register("dummyWork")}
            error={form.formState.errors.dummyWork?.message}
          />
          <ChoiceField
            id="whistle"
            label="Whistle"
            options={startedStates}
            labels={startedLabels}
            register={form.register("whistle")}
            error={form.formState.errors.whistle?.message}
          />
          <ChoiceField
            id="steadyBirds"
            label="Steady to birds"
            options={steadyStates}
            labels={steadyLabels}
            register={form.register("steadyBirds")}
            error={form.formState.errors.steadyBirds?.message}
          />
          <ChoiceField
            id="steadyDogs"
            label="Steady to other dogs"
            options={steadyStates}
            labels={steadyLabels}
            register={form.register("steadyDogs")}
            error={form.formState.errors.steadyDogs?.message}
          />
          <ChoiceField
            id="steadyShot"
            label="Steady to shot"
            options={shotSteadyStates}
            labels={shotSteadyLabels}
            register={form.register("steadyShot")}
            error={form.formState.errors.steadyShot?.message}
          />
          <ChoiceField
            id="hasGround"
            label="Do you have a place outdoors we can train?"
            hint={groundHint}
            options={groundOptions}
            labels={groundLabels}
            register={form.register("hasGround")}
            error={form.formState.errors.hasGround?.message}
          />
          <div className="space-y-2">
            <Label htmlFor="groundNotes">Notes about the place (optional)</Label>
            <Textarea
              id="groundNotes"
              maxLength={2000}
              placeholder="Gates, livestock, how we get in, or what you mean by other."
              {...form.register("groundNotes")}
            />
            <FieldError message={form.formState.errors.groundNotes?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fearTriggers">Fear or startle triggers</Label>
            <Textarea id="fearTriggers" maxLength={2000} {...form.register("fearTriggers")} />
            <FieldError message={form.formState.errors.fearTriggers?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aggressionNotes">Aggression or concern notes</Label>
            <Textarea id="aggressionNotes" maxLength={2000} {...form.register("aggressionNotes")} />
            <FieldError message={form.formState.errors.aggressionNotes?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="previousTraining">Previous training</Label>
            <Textarea id="previousTraining" maxLength={2000} {...form.register("previousTraining")} />
            <FieldError message={form.formState.errors.previousTraining?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extraNotes">Additional notes (optional)</Label>
            <Textarea
              id="extraNotes"
              maxLength={2000}
              placeholder="Anything else I should know before we train."
              {...form.register("extraNotes")}
            />
            <FieldError message={form.formState.errors.extraNotes?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea
              id="goals"
              placeholder="What do you want this dog to do - at home, beating, picking-up, or at the peg?"
              maxLength={2000}
              {...form.register("goals")}
            />
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
              <span className="font-medium">Dog:</span> {values.dogName}
              {values.existingDogId
                ? " (existing record)"
                : `, ${values.breed}, ${formatDogAge({
                    ageYears: Number(values.ageYears) || 0,
                    ageMonths: typeof values.ageMonths === "number" ? values.ageMonths : undefined,
                  })}`}
            </p>
            {values.dogJob ? (
              <p>
                <span className="font-medium">Job:</span> {dogJobLabels[values.dogJob]}
              </p>
            ) : null}
            {choiceLine("Dummy work", values.dummyWork, startedLabels)}
            {choiceLine("Whistle", values.whistle, startedLabels)}
            {choiceLine("Steady to birds", values.steadyBirds, steadyLabels)}
            {choiceLine("Steady to other dogs", values.steadyDogs, steadyLabels)}
            {choiceLine("Steady to shot", values.steadyShot, shotSteadyLabels)}
            {choiceLine("Place to train", values.hasGround, groundLabels)}
            {values.groundNotes ? (
              <p>
                <span className="font-medium">Place notes:</span> {values.groundNotes}
              </p>
            ) : null}
            {values.extraNotes ? (
              <p>
                <span className="font-medium">Additional notes:</span> {values.extraNotes}
              </p>
            ) : null}
            {values.existingDogId ? (
              <p className="text-muted-foreground">We’ll use the intake already on file for this dog.</p>
            ) : (
              <p>
                <span className="font-medium">Goals:</span> {values.goals}
              </p>
            )}
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
          step === 2 && existingDogs.length > 0 && !addingNewDog ? (
            <span />
          ) : (
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          )
        ) : (
          <Button type="submit" disabled={form.formState.isSubmitting || !values.consentDataStorage} aria-busy={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending..." : "Submit intake"}
          </Button>
        )}
      </div>
    </form>
  );
}
