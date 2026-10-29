import { z } from "zod";
import { ageMonthsField, ageYearsField, emailAddress, personName, quantityLabel } from "@/lib/validations/fields";

export const dogSexes = ["male", "female", "unknown"] as const;
export const dogJobs = ["pet", "beating", "picking_up", "peg", "tests", "non_gundog"] as const;
export const startedStates = ["not_started", "started"] as const;
export const steadyStates = ["steady", "not_yet", "not_sure"] as const;
export const shotSteadyStates = ["steady", "not_yet", "not_sure", "not_required"] as const;
export const groundOptions = [
  "enclosed_field",
  "open_field",
  "paddock",
  "open_land",
  "back_garden",
  "nowhere",
  "other",
] as const;

export const dogJobLabels: Record<(typeof dogJobs)[number], string> = {
  pet: "Pet gundog",
  beating: "Beating",
  picking_up: "Picking-up",
  peg: "Peg dog",
  tests: "Working tests",
  non_gundog: "Not a gundog",
};

export const startedLabels: Record<(typeof startedStates)[number], string> = {
  not_started: "Not started",
  started: "Started",
};

export const steadyLabels: Record<(typeof steadyStates)[number], string> = {
  steady: "Steady",
  not_yet: "Not yet",
  not_sure: "Not sure",
};

export const shotSteadyLabels: Record<(typeof shotSteadyStates)[number], string> = {
  steady: "Steady",
  not_yet: "Not yet",
  not_sure: "Not sure",
  not_required: "Not needed",
};

export const groundLabels: Record<(typeof groundOptions)[number], string> = {
  enclosed_field: "Enclosed field",
  open_field: "Open field",
  paddock: "Paddock",
  open_land: "Open land",
  back_garden: "Back garden",
  nowhere: "Nowhere to train outside",
  other: "Other",
};

export const legacyGroundLabels: Record<string, string> = {
  ...groundLabels,
  yes: "Yes, I have a place we can use",
  no: "No, I don't have a place",
};

export const groundHint = "The place you can use for the session.";

function emptyOrEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.union([z.literal(""), z.enum(values)]);
}

const ukPostcode = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;

const optionalText = z.string().trim().max(2000, "Keep this to 2000 characters").default("");
const addressLine = z.string().trim().max(100, "Address must be 100 characters or fewer").default("");

export const intakeFormSchema = z
  .object({
    ownerName: personName("Name", 60, 2),
    ownerEmail: emailAddress,
    ownerPhone: z
      .string()
      .trim()
      .max(20, "Phone number is too long")
      .default("")
      .refine((value) => !value || /^[+0-9()\s-]{10,20}$/.test(value), "Enter a valid phone number"),
    meetingType: z.enum(["virtual", "in_person"]),
    addressLine1: addressLine,
    addressLine2: addressLine,
    city: z.string().trim().max(60, "Town or city must be 60 characters or fewer").default(""),
    postcode: z.string().trim().max(10, "Postcode is too long").default(""),
    dogName: personName("Dog’s name", 40),
    breed: personName("Breed", 40),
    ageYears: ageYearsField,
    ageMonths: ageMonthsField,
    sex: z.enum(dogSexes),
    neutered: z.boolean(),
    dogJob: emptyOrEnum(dogJobs),
    dummyWork: emptyOrEnum(startedStates),
    whistle: emptyOrEnum(startedStates),
    steadyBirds: emptyOrEnum(steadyStates),
    steadyDogs: emptyOrEnum(steadyStates),
    steadyShot: emptyOrEnum(shotSteadyStates),
    hasGround: emptyOrEnum(groundOptions),
    groundNotes: optionalText,
    fearTriggers: optionalText,
    aggressionNotes: optionalText,
    previousTraining: optionalText,
    extraNotes: optionalText,
    goals: z.string().trim().max(2000).default(""),
    consentDataStorage: z.boolean().refine((value) => value === true, {
      message: "Please agree so we can store this intake securely",
    }),
    existingDogId: z.string().optional(),
    botField: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.existingDogId && data.goals.trim().length < 10) {
      ctx.addIssue({ code: "custom", path: ["goals"], message: "Tell us a little about your goals" });
    }
    if (!data.existingDogId) {
      const required: [string, string][] = [
        [data.dogJob, "dogJob"],
        [data.dummyWork, "dummyWork"],
        [data.whistle, "whistle"],
        [data.steadyBirds, "steadyBirds"],
        [data.steadyDogs, "steadyDogs"],
        [data.steadyShot, "steadyShot"],
        [data.hasGround, "hasGround"],
      ];
      for (const [value, path] of required) {
        if (!value) {
          ctx.addIssue({ code: "custom", path: [path], message: "Choose an answer" });
        }
      }
      if (data.ageYears < 1 && data.ageMonths === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["ageMonths"],
          message: "Enter the puppy’s age in months",
        });
      }
    }
    if (data.meetingType !== "in_person") {
      return;
    }
    if (!data.addressLine1) {
      ctx.addIssue({ code: "custom", path: ["addressLine1"], message: "Address is required for in-person sessions" });
    }
    if (!data.city) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "Town or city is required" });
    }
    if (!data.postcode || !ukPostcode.test(data.postcode)) {
      ctx.addIssue({ code: "custom", path: ["postcode"], message: "Enter a UK postcode" });
    }
  });

export type IntakeFormValues = z.output<typeof intakeFormSchema>;
export type IntakeFormInput = z.input<typeof intakeFormSchema>;

export type IntakeFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof IntakeFormValues, string>>;
  clientId?: string;
  dogId?: string;
};

export const intakeStepFields = {
  1: ["ownerName", "ownerEmail", "ownerPhone", "meetingType", "addressLine1", "addressLine2", "city", "postcode"],
  2: ["dogName", "breed", "ageYears", "ageMonths", "sex", "neutered"],
  3: [
    "dogJob",
    "dummyWork",
    "whistle",
    "steadyBirds",
    "steadyDogs",
    "steadyShot",
    "hasGround",
    "groundNotes",
    "fearTriggers",
    "aggressionNotes",
    "previousTraining",
    "extraNotes",
    "goals",
  ],
  4: ["consentDataStorage"],
} as const;

export function formatIntakeAddress(values: {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
}) {
  return [values.addressLine1, values.addressLine2, values.city, values.postcode]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

const legacyGround = ["yes", "no"] as const;

export const trainerIntakeSchema = z
  .object({
    dogId: z.string().min(1),
    ownerName: personName("Name", 60, 2),
    ownerEmail: emailAddress,
    ownerPhone: z
      .string()
      .trim()
      .max(20, "Phone number is too long")
      .default("")
      .refine((value) => !value || /^[+0-9()\s-]{10,20}$/.test(value), "Enter a valid phone number"),
    meetingType: z.enum(["virtual", "in_person"]),
    addressLine1: addressLine,
    addressLine2: addressLine,
    city: z.string().trim().max(60, "Town or city must be 60 characters or fewer").default(""),
    postcode: z.string().trim().max(10, "Postcode is too long").default(""),
    dogName: personName("Dog’s name", 40),
    breed: personName("Breed", 40),
    ageYears: ageYearsField,
    ageMonths: ageMonthsField,
    sex: z.enum(dogSexes),
    neutered: z.boolean(),
    dogJob: emptyOrEnum(dogJobs),
    dummyWork: emptyOrEnum(startedStates),
    whistle: emptyOrEnum(startedStates),
    steadyBirds: emptyOrEnum(steadyStates),
    steadyDogs: emptyOrEnum(steadyStates),
    steadyShot: emptyOrEnum(shotSteadyStates),
    hasGround: z.union([z.literal(""), z.enum(groundOptions), z.enum(legacyGround)]),
    groundNotes: optionalText,
    fearTriggers: optionalText,
    aggressionNotes: optionalText,
    previousTraining: optionalText,
    extraNotes: optionalText,
    goals: z.string().trim().max(2000).default(""),
    trainerNotes: optionalText,
  })
  .superRefine((data, ctx) => {
    if (data.meetingType !== "in_person") {
      return;
    }
    if (!data.addressLine1) {
      ctx.addIssue({ code: "custom", path: ["addressLine1"], message: "Address is required for in-person sessions" });
    }
    if (!data.city) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "Town or city is required" });
    }
    if (!data.postcode || !ukPostcode.test(data.postcode)) {
      ctx.addIssue({ code: "custom", path: ["postcode"], message: "Enter a UK postcode" });
    }
  });

export type TrainerIntakeValues = z.output<typeof trainerIntakeSchema>;

export function formatDogAge(values: { ageYears: number; ageMonths?: number }) {
  const months = values.ageMonths ? quantityLabel(values.ageMonths, "month", "months") : "";
  if (values.ageYears < 1) {
    return months || "0 years";
  }
  const years = quantityLabel(values.ageYears, "year", "years");
  return months ? `${years}, ${months}` : years;
}
