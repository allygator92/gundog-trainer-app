import { z } from "zod";

export const skillLevels = ["poor", "fair", "good", "excellent"] as const;
export const dogSexes = ["male", "female", "unknown"] as const;

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
    sex: z.enum(dogSexes),
    neutered: z.boolean(),
    recall: z.enum(skillLevels),
    leadWalking: z.enum(skillLevels),
    fearTriggers: optionalText,
    aggressionNotes: optionalText,
    previousTraining: optionalText,
    goals: z.string().trim().min(10, "Tell us a little about your goals").max(2000),
    consentDataStorage: z.boolean().refine((value) => value === true, {
      message: "Please agree so we can store this intake securely",
    }),
    website: z.string().optional(),
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
  2: ["dogName", "breed", "ageYears", "sex", "neutered"],
  3: ["recall", "leadWalking", "fearTriggers", "aggressionNotes", "previousTraining", "goals"],
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
