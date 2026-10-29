import { z } from "zod";
import { emailAddress, personName } from "@/lib/validations/fields";

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .refine(
    (value) => !value || /^[+0-9()\s-]{10,20}$/.test(value),
    "Enter a valid phone number",
  );

export const contactFormSchema = z.object({
  name: personName("Name", 60, 2),
  email: emailAddress,
  phone: optionalPhone,
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long")
    .refine((value) => /\p{L}/u.test(value), "Write a short message")
    .refine((value) => !/(.)\1{9,}/u.test(value), "Message looks incomplete"),
  website: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
};
