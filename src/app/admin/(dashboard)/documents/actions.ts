"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_DOCUMENT_BYTES,
  extensionForMime,
  isAllowedDocumentMime,
  safeDocumentFilename,
  uploadPrivateFile,
} from "@/lib/supabase/storage";

export async function uploadClientDocumentAction(formData: FormData) {
  await requireAdmin();

  const clientId = String(formData.get("clientId") ?? "");
  const file = formData.get("file");

  if (!clientId) {
    return { ok: false as const, error: "Choose a client." };
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return { ok: false as const, error: "That client was not found." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Choose a PDF or image to upload." };
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    return { ok: false as const, error: "That file is over 10 MB." };
  }

  if (!isAllowedDocumentMime(file.type)) {
    return { ok: false as const, error: "Use a PDF, JPEG, PNG, or WebP file." };
  }

  const filename = safeDocumentFilename(file.name) || `record.${extensionForMime(file.type)}`;
  const storagePath = `${clientId}/record-${Date.now()}-${filename}`;
  const body = Buffer.from(await file.arrayBuffer());

  try {
    await uploadPrivateFile(storagePath, body, file.type);
    await prisma.document.create({
      data: {
        clientId,
        storagePath,
        filename,
        type: "record",
      },
    });
  } catch (error) {
    console.error("Admin document upload failed:", error);
    return { ok: false as const, error: "Could not store that file. Try again." };
  }

  revalidatePath("/admin/documents");
  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true as const };
}
