"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { notifyWaitlistForDate } from "@/lib/waitlist";

export async function cancelBookingAction(bookingId: string) {
  await requireAdmin();

  if (!bookingId) {
    return { ok: false as const, error: "Missing booking." };
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return { ok: false as const, error: "That booking was not found." };
  }
  if (booking.status === "cancelled") {
    return { ok: false as const, error: "That booking is already cancelled." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" },
  });
  await notifyWaitlistForDate(booking.startsAt);

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath(`/admin/clients/${booking.clientId}`);
  revalidatePath("/book");
  return { ok: true as const };
}

export async function saveBookingNotesAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000);

  if (!bookingId) {
    return;
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { notes: notes || null },
  });

  revalidatePath(`/admin/bookings/${bookingId}`);
}
