import { z } from "zod";

const personNamePattern = /^[\p{L}][\p{L}'’.\- ]*$/u;

export function personName(label: string, max: number, min = 1) {
  return z
    .string()
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`)
    .regex(personNamePattern, `${label} can use letters, spaces, hyphens, or apostrophes`);
}

export const emailAddress = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(120, "Email must be 120 characters or fewer")
  .refine((value) => value.includes("@"), "Enter an email address with an @ sign")
  .refine(
    (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
    "Enter a valid email address",
  );

function asDigitString(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

export const ageYearsField = z.preprocess(
  asDigitString,
  z
    .string()
    .regex(/^\d+$/, "Enter the age in whole years")
    .transform(Number)
    .refine((value) => value <= 25, "Enter an age up to 25 years"),
);

export const ageMonthsField = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  return asDigitString(value);
}, z
  .string()
  .regex(/^\d+$/, "Enter the age in whole months")
  .transform(Number)
  .refine((value) => value >= 1 && value <= 18, "Enter the puppy’s age in months")
  .optional());

export function quantityLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
