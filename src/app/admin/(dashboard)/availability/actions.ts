"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { BOOKING_TIMEZONE, breakHoursError, rulesFromDayHours, WEEKDAYS, type DayHours } from "@/lib/availability";
import { eachDateKeyInclusive, isDateKey, MAX_BLOCKED_RANGE_DAYS } from "@/lib/blocked-dates";
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
      hasBreak: z.boolean(),
      breakStartTime: timeSchema,
      breakEndTime: timeSchema,
    }),
  ),
});

export async function saveWeeklyHoursAction(input: unknown) {
  await requireAdmin();
  const parsed = weeklyHoursSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check the hours and try again." };
  }

  const days = parsed.data.days as DayHours[];
  const rules = [];

  for (const day of days) {
    const label = WEEKDAYS.find((item) => item.dayOfWeek === day.dayOfWeek)?.label ?? "that day";
    if (day.isActive && day.startTime >= day.endTime) {
      return { ok: false as const, error: `${label} needs an end time after the start time.` };
    }
    const breakError = breakHoursError({ ...day, label });
    if (breakError) {
      return { ok: false as const, error: breakError };
    }
    rules.push(...rulesFromDayHours({ ...day, label }));
  }

  await prisma.$transaction([
    prisma.availabilityRule.deleteMany(),
    prisma.availabilityRule.createMany({
      data: rules.map((rule) => ({
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
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
  const startValue = String(formData.get("startDate") ?? formData.get("date") ?? "");
  const endValue = String(formData.get("endDate") ?? startValue);
  const reason = String(formData.get("reason") ?? "").trim();

  if (!isDateKey(startValue) || !isDateKey(endValue)) {
    return { ok: false as const, error: "Pick a start and end date to block." };
  }

  const dateKeys = eachDateKeyInclusive(startValue, endValue);
  if (dateKeys.length > MAX_BLOCKED_RANGE_DAYS) {
    return { ok: false as const, error: "Please block at most two months at a time." };
  }

  const result = await prisma.blockedDate.createMany({
    data: dateKeys.map((dateKey) => ({
      date: fromZonedTime(`${dateKey}T00:00:00`, BOOKING_TIMEZONE),
      reason: reason || undefined,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/admin/availability");
  revalidatePath("/book");
  return { ok: true as const, added: result.count };
}

export async function removeBlockedDateAction(formData: FormData) {
  await requireAdmin();
  const ids = String(formData.get("ids") ?? formData.get("id") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return { ok: false as const, error: "Missing blocked date." };
  }

  await prisma.blockedDate.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/availability");
  revalidatePath("/book");
  return { ok: true as const };
}
