"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { BOOKING_TIMEZONE, WEEKDAYS } from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import { fromZonedTime } from "date-fns-tz";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeSchema = z
  .string()
  .transform((value) => value.slice(0, 5))
  .refine((value) => timePattern.test(value), "Use 24-hour time, for example 09:00");

const weeklyHoursSchema = z.object({
  days: z.array(
    z.object({
      dayOfWeek: z.number().int().min(1).max(7),
      isActive: z.boolean(),
      startTime: timeSchema,
      endTime: timeSchema,
    }),
  ),
});

export async function saveWeeklyHoursAction(input: unknown) {
  await requireAdmin();
  const parsed = weeklyHoursSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check the hours and try again." };
  }

  const activeDays = parsed.data.days.filter((day) => day.isActive);
  for (const day of activeDays) {
    if (day.startTime >= day.endTime) {
      const label = WEEKDAYS.find((item) => item.dayOfWeek === day.dayOfWeek)?.label ?? "that day";
      return { ok: false as const, error: `${label} needs an end time after the start time.` };
    }
  }

  await prisma.$transaction([
    prisma.availabilityRule.deleteMany(),
    prisma.availabilityRule.createMany({
      data: activeDays.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        isActive: true,
      })),
    }),
  ]);

  revalidatePath("/admin/availability");
  revalidatePath("/book");
  return { ok: true as const };
}

export async function addBlockedDateAction(formData: FormData) {
  await requireAdmin();
  const dateValue = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return { ok: false as const, error: "Pick a date to block." };
  }

  const date = fromZonedTime(`${dateValue}T00:00:00`, BOOKING_TIMEZONE);

  try {
    await prisma.blockedDate.create({
      data: {
        date,
        reason: reason || undefined,
      },
    });
  } catch {
    return { ok: false as const, error: "That date is already blocked." };
  }

  revalidatePath("/admin/availability");
  revalidatePath("/book");
  return { ok: true as const };
}

export async function removeBlockedDateAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { ok: false as const, error: "Missing blocked date." };
  }

  await prisma.blockedDate.delete({ where: { id } });
  revalidatePath("/admin/availability");
  revalidatePath("/book");
  return { ok: true as const };
}
