import { z } from "zod";
import { SUPPORT_KINDS, SUPPORT_STATUSES } from "@/lib/support";

export const supportKindSchema = z.enum(SUPPORT_KINDS);
export const supportStatusSchema = z.enum(SUPPORT_STATUSES);

export const createSupportRequestSchema = z.object({
  kind: supportKindSchema,
  title: z.string().trim().min(4, "Add a short title").max(120, "Title is too long"),
  body: z
    .string()
    .trim()
    .min(20, "Please describe what you need in a bit more detail")
    .max(5000, "That’s too long — please shorten it"),
});

export const updateSupportStatusSchema = z
  .object({
    requestId: z.string().trim().min(1),
    status: supportStatusSchema,
    notes: z
      .string()
      .trim()
      .max(4000, "Notes are too long")
      .optional()
      .transform((value) => value || undefined),
  })
  .superRefine((data, ctx) => {
    if (data.status === "needs_feedback" && !data.notes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ask what extra detail you need.",
        path: ["notes"],
      });
    }
  });

export const addSupportFeedbackSchema = z.object({
  requestId: z.string().trim().min(1),
  body: z.string().trim().min(10, "Add a bit more detail").max(4000, "That’s too long — please shorten it"),
});

export type CreateSupportRequestValues = z.infer<typeof createSupportRequestSchema>;
