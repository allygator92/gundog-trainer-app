"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deletePrivateFiles } from "@/lib/supabase/storage";

export async function deleteClientAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const clientId = String(formData.get("clientId") ?? "");
  const confirmName = String(formData.get("confirmName") ?? "").trim();

  if (!clientId) {
    return;
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { documents: { select: { storagePath: true } } },
  });

  if (!client) {
    return;
  }

  if (confirmName.toLowerCase() !== client.name.trim().toLowerCase()) {
    redirect(`/admin/clients/${clientId}?error=${encodeURIComponent("Type the client’s name exactly to delete.")}`);
  }

  await deletePrivateFiles(client.documents.map((document) => document.storagePath));
  await prisma.client.delete({ where: { id: clientId } });

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/intakes");
  revalidatePath("/admin/documents");
  redirect("/admin/clients");
}
