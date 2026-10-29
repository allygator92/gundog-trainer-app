import { updateDogIntakeAction } from "@/app/admin/(dashboard)/intakes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { IntakeRecordDefaults } from "@/lib/intake-record";
import {
  dogJobLabels,
  dogJobs,
  groundOptions,
  legacyGroundLabels,
  shotSteadyLabels,
  shotSteadyStates,
  startedLabels,
  startedStates,
  steadyLabels,
  steadyStates,
} from "@/lib/validations/intake";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Choice({
  id,
  name,
  label,
  value,
  options,
  labels,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  options: readonly string[];
  labels: Record<string, string>;
}) {
  const choices = options.includes(value) || value === "" ? options : [...options, value];
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} name={name} defaultValue={value} className={selectClassName}>
        <option value="">Choose</option>
        {choices.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function IntakeRecordForm({
  defaults,
  returnTo,
  saved,
  error,
}: {
  defaults: IntakeRecordDefaults;
  returnTo: string;
  saved?: boolean;
  error?: string;
}) {
  const id = defaults.dogId;

  return (
    <form action={updateDogIntakeAction} className="space-y-6 rounded-xl border bg-card p-4">
      <div>
        <h4 className="font-medium">Update this intake</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Add what you saw after the appointment, or correct an answer. Saving keeps it on this dog and refreshes
          the intake PDF.
        </p>
      </div>
      <input type="hidden" name="dogId" value={defaults.dogId} />
      <input type="hidden" name="returnTo" value={returnTo} />

      {saved ? <p className="text-sm text-primary">Intake updated.</p> : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${id}-trainerNotes`}>Trainer notes</Label>
        <Textarea
          id={`${id}-trainerNotes`}
          name="trainerNotes"
          defaultValue={defaults.trainerNotes}
          maxLength={2000}
          placeholder="What you want to remember after the session."
        />
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Owner</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-ownerName`}>Name</Label>
            <Input id={`${id}-ownerName`} name="ownerName" defaultValue={defaults.ownerName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-ownerEmail`}>Email</Label>
            <Input
              id={`${id}-ownerEmail`}
              name="ownerEmail"
              type="email"
              defaultValue={defaults.ownerEmail}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-ownerPhone`}>Phone</Label>
            <Input id={`${id}-ownerPhone`} name="ownerPhone" defaultValue={defaults.ownerPhone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-meetingType`}>Session</Label>
            <select
              id={`${id}-meetingType`}
              name="meetingType"
              defaultValue={defaults.meetingType}
              className={selectClassName}
            >
              <option value="virtual">Virtual</option>
              <option value="in_person">In person</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-addressLine1`}>Address</Label>
            <Input id={`${id}-addressLine1`} name="addressLine1" defaultValue={defaults.addressLine1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-addressLine2`}>Address line 2</Label>
            <Input id={`${id}-addressLine2`} name="addressLine2" defaultValue={defaults.addressLine2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-city`}>Town / city</Label>
            <Input id={`${id}-city`} name="city" defaultValue={defaults.city} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-postcode`}>Postcode</Label>
            <Input id={`${id}-postcode`} name="postcode" defaultValue={defaults.postcode} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Dog</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${id}-dogName`}>Name</Label>
            <Input id={`${id}-dogName`} name="dogName" defaultValue={defaults.dogName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-breed`}>Breed</Label>
            <Input id={`${id}-breed`} name="breed" defaultValue={defaults.breed} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-ageYears`}>Age in years</Label>
            <Input
              id={`${id}-ageYears`}
              name="ageYears"
              type="number"
              min={0}
              max={25}
              defaultValue={defaults.ageYears}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-ageMonths`}>Extra months</Label>
            <Input
              id={`${id}-ageMonths`}
              name="ageMonths"
              type="number"
              min={1}
              max={18}
              defaultValue={defaults.ageMonths}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-sex`}>Sex</Label>
            <select id={`${id}-sex`} name="sex" defaultValue={defaults.sex} className={selectClassName}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-neutered`}>Neutered</Label>
            <select
              id={`${id}-neutered`}
              name="neutered"
              defaultValue={defaults.neutered ? "yes" : "no"}
              className={selectClassName}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Training</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Choice
            id={`${id}-dogJob`}
            name="dogJob"
            label="What is this dog for"
            value={defaults.dogJob}
            options={dogJobs}
            labels={dogJobLabels}
          />
          <Choice
            id={`${id}-dummyWork`}
            name="dummyWork"
            label="Dummy work"
            value={defaults.dummyWork}
            options={startedStates}
            labels={startedLabels}
          />
          <Choice
            id={`${id}-whistle`}
            name="whistle"
            label="Whistle"
            value={defaults.whistle}
            options={startedStates}
            labels={startedLabels}
          />
          <Choice
            id={`${id}-steadyBirds`}
            name="steadyBirds"
            label="Steady to birds"
            value={defaults.steadyBirds}
            options={steadyStates}
            labels={steadyLabels}
          />
          <Choice
            id={`${id}-steadyDogs`}
            name="steadyDogs"
            label="Steady to other dogs"
            value={defaults.steadyDogs}
            options={steadyStates}
            labels={steadyLabels}
          />
          <Choice
            id={`${id}-steadyShot`}
            name="steadyShot"
            label="Steady to shot"
            value={defaults.steadyShot}
            options={shotSteadyStates}
            labels={shotSteadyLabels}
          />
          <Choice
            id={`${id}-hasGround`}
            name="hasGround"
            label="Place outdoors"
            value={defaults.hasGround}
            options={groundOptions}
            labels={legacyGroundLabels}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-groundNotes`}>Notes about the place</Label>
          <Textarea id={`${id}-groundNotes`} name="groundNotes" defaultValue={defaults.groundNotes} maxLength={2000} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">What the client wrote</legend>
        <div className="space-y-2">
          <Label htmlFor={`${id}-fearTriggers`}>Fear or startle triggers</Label>
          <Textarea id={`${id}-fearTriggers`} name="fearTriggers" defaultValue={defaults.fearTriggers} maxLength={2000} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-aggressionNotes`}>Aggression or concern notes</Label>
          <Textarea
            id={`${id}-aggressionNotes`}
            name="aggressionNotes"
            defaultValue={defaults.aggressionNotes}
            maxLength={2000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-previousTraining`}>Previous training</Label>
          <Textarea
            id={`${id}-previousTraining`}
            name="previousTraining"
            defaultValue={defaults.previousTraining}
            maxLength={2000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-extraNotes`}>Additional notes</Label>
          <Textarea id={`${id}-extraNotes`} name="extraNotes" defaultValue={defaults.extraNotes} maxLength={2000} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-goals`}>Goals</Label>
          <Textarea id={`${id}-goals`} name="goals" defaultValue={defaults.goals} maxLength={2000} />
        </div>
      </fieldset>

      <Button type="submit">Save intake</Button>
    </form>
  );
}
