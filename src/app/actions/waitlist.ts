"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { formatInTimeZone } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import { BOOKING_TIMEZONE, parseLondon } from "@/lib/availability";
import { sendWaitlistJoinedNotification } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const waitlistSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().optional(),
});

export async function joinWaitlistAction(input: unknown) {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check your name, email, and date." };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`waitlist:${ip}`, 8, 60 * 60 * 1000)) {
    return { ok: false as const, error: "Too many waitlist requests. Please try again later." };
  }

  try {
    await prisma.waitlistEntry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        date: parseLondon(parsed.data.dateKey, "00:00"),
        serviceId: parsed.data.serviceId || undefined,
      },
    });
  } catch {
    return { ok: true as const, message: "You’re already on the waitlist for that day." };
  }

  const dateLabel = formatInTimeZone(
    parseLondon(parsed.data.dateKey, "12:00"),
    BOOKING_TIMEZONE,
    "EEEE d MMMM",
  );
  await sendWaitlistJoinedNotification({
    name: parsed.data.name,
    email: parsed.data.email,
    dateLabel,
  });
  revalidatePath("/admin/waitlist");
  return { ok: true as const, message: `We’ll email you if a time opens on ${dateLabel}.` };
}
