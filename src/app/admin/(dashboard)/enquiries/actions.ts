"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function refreshEnquiries() {
  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
}

export async function archiveEnquiryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  await prisma.contactSubmission.updateMany({
    where: { id, archivedAt: null },
    data: { archivedAt: new Date() },
  });
  refreshEnquiries();
}

export async function restoreEnquiryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  await prisma.contactSubmission.updateMany({
    where: { id, archivedAt: { not: null } },
    data: { archivedAt: null },
  });
  refreshEnquiries();
}

export async function archiveAllEnquiriesAction() {
  await requireAdmin();
  await prisma.contactSubmission.updateMany({
    where: { archivedAt: null },
    data: { archivedAt: new Date() },
  });
  refreshEnquiries();
}
