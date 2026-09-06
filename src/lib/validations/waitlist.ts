import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().optional(),
});

export type WaitlistValues = z.infer<typeof waitlistSchema>;
