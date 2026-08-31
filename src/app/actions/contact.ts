"use server";

import { headers } from "next/headers";
import { sendContactNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { contactFormSchema, type ContactFormState } from "@/lib/validations/contact";

export async function submitContactAction(input: unknown): Promise<ContactFormState> {
  const parsed = contactFormSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "email" || field === "phone" || field === "message") {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  if (parsed.data.website) {
    return { status: "success", message: "Thanks — I’ll get back to you shortly." };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return {
      status: "error",
      message: "Too many messages from this connection. Please try again later.",
    };
  }

  await prisma.contactSubmission.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    },
  });

  await sendContactNotification({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
  });

  return { status: "success", message: "Thanks — I’ll get back to you shortly." };
}
