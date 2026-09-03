"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-auth";
import { getAppUrl } from "@/lib/app-url";
import { sendSupportFeedbackEmail, sendSupportRequestEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import {
  addSupportFeedbackSchema,
  createSupportRequestSchema,
  updateSupportStatusSchema,
} from "@/lib/validations/support";

function adminSupportUrl(id: string) {
  return `${getAppUrl()}/admin/support/${id}`;
}

export async function createSupportRequestAction(input: unknown) {
  const user = await requireAdmin();
  const parsed = createSupportRequestSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<"kind" | "title" | "body", string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "kind" || field === "title" || field === "body") {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false as const,
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`support:${user.id}:${ip}`, 8, 60 * 60 * 1000)) {
    return {
      ok: false as const,
      message: "Too many support requests from this connection. Please try again later.",
    };
  }

  const submittedBy = user.email ?? "admin";
  const request = await prisma.supportRequest.create({
    data: {
      kind: parsed.data.kind,
      title: parsed.data.title,
      body: parsed.data.body,
      submittedBy,
    },
  });

  const emailed = await sendSupportRequestEmail({
    kind: parsed.data.kind,
    title: parsed.data.title,
    body: parsed.data.body,
    submittedBy,
    adminUrl: adminSupportUrl(request.id),
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${request.id}`);

  return {
    ok: true as const,
    id: request.id,
    emailed,
    message: emailed
      ? "Your request has been sent. You’ll see status updates here as it’s investigated and resolved."
      : "Your request is saved here. The email notification could not be sent, but it is still in Support.",
  };
}

export async function updateSupportStatusAction(input: unknown) {
  const user = await requireAdmin();
  const parsed = updateSupportStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const existing = await prisma.supportRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!existing) {
    return { ok: false as const, error: "That request was not found." };
  }

  const notes = parsed.data.notes;
  const resolutionNotes =
    parsed.data.status === "resolved" ? (notes ?? existing.resolutionNotes) : existing.resolutionNotes;

  await prisma.$transaction(async (tx) => {
    await tx.supportRequest.update({
      where: { id: existing.id },
      data: {
        status: parsed.data.status,
        resolutionNotes,
      },
    });
    if (notes) {
      await tx.supportMessage.create({
        data: {
          requestId: existing.id,
          authorEmail: user.email ?? "admin",
          body: notes,
        },
      });
    }
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${existing.id}`);
  return { ok: true as const, message: "Status updated." };
}

export async function addSupportFeedbackAction(input: unknown) {
  const user = await requireAdmin();
  const parsed = addSupportFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Please add a bit more detail." };
  }

  const existing = await prisma.supportRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!existing) {
    return { ok: false as const, error: "That request was not found." };
  }

  const submittedBy = user.email ?? "admin";
  await prisma.$transaction([
    prisma.supportMessage.create({
      data: {
        requestId: existing.id,
        authorEmail: submittedBy,
        body: parsed.data.body,
      },
    }),
    prisma.supportRequest.update({
      where: { id: existing.id },
      data: {
        status: existing.status === "needs_feedback" ? "investigating" : existing.status,
      },
    }),
  ]);

  await sendSupportFeedbackEmail({
    title: existing.title,
    body: parsed.data.body,
    submittedBy,
    adminUrl: adminSupportUrl(existing.id),
  });

  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${existing.id}`);
  return { ok: true as const, message: "Thanks — your extra detail has been sent." };
}
