import { z } from "zod";
import { emailAddress, personName } from "@/lib/validations/fields";

export const waitlistSchema = z.object({
  name: personName("Name", 60, 2),
  email: emailAddress,
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().optional(),
});

export type WaitlistValues = z.infer<typeof waitlistSchema>;
