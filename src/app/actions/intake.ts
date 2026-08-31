"use server";

import { headers } from "next/headers";
import { sendIntakeNotification } from "@/lib/email";
import { generateIntakePdf } from "@/lib/pdf/intake-document";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { uploadPrivatePdf } from "@/lib/supabase/storage";
import {
  formatIntakeAddress,
  intakeFormSchema,
  type IntakeFormState,
} from "@/lib/validations/intake";

export async function submitIntakeAction(input: unknown): Promise<IntakeFormState> {
  const parsed = intakeFormSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: IntakeFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string") {
        fieldErrors[field as keyof NonNullable<IntakeFormState["fieldErrors"]>] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  if (parsed.data.website) {
    return { status: "success", message: "Thanks — your intake has been received." };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`intake:${ip}`, 5, 60 * 60 * 1000)) {
    return {
      status: "error",
      message: "Too many submissions from this connection. Please try again later.",
    };
  }

  try {
    const consentedAt = new Date().toISOString();
  const address =
    parsed.data.meetingType === "in_person" ? formatIntakeAddress(parsed.data) : undefined;

  const existingClient = await prisma.client.findFirst({
    where: { email: parsed.data.ownerEmail },
  });

  const client = existingClient
    ? await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          name: parsed.data.ownerName,
          phone: parsed.data.ownerPhone || undefined,
          address,
        },
      })
    : await prisma.client.create({
        data: {
          name: parsed.data.ownerName,
          email: parsed.data.ownerEmail,
          phone: parsed.data.ownerPhone || undefined,
          address,
        },
      });

  const dog = await prisma.dog.create({
    data: {
      clientId: client.id,
      name: parsed.data.dogName,
      breed: parsed.data.breed,
      age: String(parsed.data.ageYears),
      behaviourNotes: parsed.data.goals,
      intakeData: {
        ...parsed.data,
        website: undefined,
        consentedAt,
      },
    },
  });

  const filename = `${parsed.data.dogName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-intake.pdf`;
  const storagePath = `${client.id}/${dog.id}-intake-${Date.now()}.pdf`;
  const pdf = await generateIntakePdf(parsed.data, consentedAt);

  await uploadPrivatePdf(storagePath, pdf);

  await prisma.document.create({
    data: {
      clientId: client.id,
      storagePath,
      filename,
      type: "intake_pdf",
    },
  });

  await sendIntakeNotification({
    ownerName: parsed.data.ownerName,
    ownerEmail: parsed.data.ownerEmail,
    dogName: parsed.data.dogName,
  });

  return {
    status: "success",
    message: "Thanks — your intake has been received.",
    clientId: client.id,
    dogId: dog.id,
  };
  } catch (error) {
    console.error("Intake submit failed:", error);
    return {
      status: "error",
      message: "Could not save your intake. Please try again in a moment.",
    };
  }
}
