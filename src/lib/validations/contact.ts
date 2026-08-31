import { z } from "zod";

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
  name: z.string().trim().min(2, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: optionalPhone,
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
  website: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
};
