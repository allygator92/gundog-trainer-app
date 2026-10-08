import { z } from "zod";

export const skillLevels = ["poor", "fair", "good", "excellent"] as const;
export const dogSexes = ["male", "female", "unknown"] as const;
export const dogJobs = ["pet", "beating", "picking_up", "peg", "tests"] as const;
export const startedStates = ["not_started", "started"] as const;
export const steadyStates = ["steady", "not_yet", "not_sure"] as const;
export const groundOptions = ["yes", "no"] as const;

export const dogJobLabels: Record<(typeof dogJobs)[number], string> = {
  pet: "Pet gundog",
  beating: "Beating",
  picking_up: "Picking-up",
  peg: "Peg dog",
  tests: "Working tests",
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

export const groundLabels: Record<(typeof groundOptions)[number], string> = {
  yes: "Yes",
  no: "No",
};

const optionalMonths = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().min(1, "Enter the puppy’s age in months").max(18, "Enter the puppy’s age in months").optional(),
);

function emptyOrEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.union([z.literal(""), z.enum(values)]);
}

const ukPostcode = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;

const optionalText = z.string().trim().max(2000).default("");

export const intakeFormSchema = z
  .object({
    ownerName: z.string().trim().min(2, "Name is required").max(100),
    ownerEmail: z.string().trim().email("Enter a valid email address"),
    ownerPhone: z
      .string()
      .trim()
      .default("")
      .refine((value) => !value || /^[+0-9()\s-]{10,20}$/.test(value), "Enter a valid phone number"),
    meetingType: z.enum(["virtual", "in_person"]),
    addressLine1: z.string().trim().default(""),
    addressLine2: z.string().trim().default(""),
    city: z.string().trim().default(""),
    postcode: z.string().trim().default(""),
    dogName: z.string().trim().min(1, "Dog’s name is required").max(80),
    breed: z.string().trim().min(1, "Breed is required").max(80),
    ageYears: z.coerce.number().min(0, "Enter a valid age").max(25, "Enter a valid age"),
    ageMonths: optionalMonths,
    sex: z.enum(dogSexes),
    neutered: z.boolean(),
    dogJob: emptyOrEnum(dogJobs),
    dummyWork: emptyOrEnum(startedStates),
    whistle: emptyOrEnum(startedStates),
    steadyBirds: emptyOrEnum(steadyStates),
    steadyDogs: emptyOrEnum(steadyStates),
    steadyShot: emptyOrEnum(steadyStates),
    hasGround: emptyOrEnum(groundOptions),
    recall: z.enum(skillLevels),
    leadWalking: z.enum(skillLevels),
    fearTriggers: optionalText,
    aggressionNotes: optionalText,
    previousTraining: optionalText,
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
    "recall",
    "leadWalking",
    "fearTriggers",
    "aggressionNotes",
    "previousTraining",
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

export function formatDogAge(values: { ageYears: number; ageMonths?: number }) {
  if (values.ageYears < 1 && values.ageMonths) {
    return `${values.ageMonths} months`;
  }
  if (values.ageYears >= 1 && values.ageMonths) {
    return `${values.ageYears} years, ${values.ageMonths} months`;
  }
  const years = values.ageYears;
  return `${years} ${years === 1 ? "year" : "years"}`;
}
