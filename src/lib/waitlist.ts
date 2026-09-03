import { addHours } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { getAppUrl } from "@/lib/app-url";
import { BOOKING_TIMEZONE, londonDay, parseLondon } from "@/lib/availability-slots";
import { sendWaitlistOpenedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function notifyWaitlistForDate(date: Date) {
  const dateKey = londonDay(date);
  const day = parseLondon(dateKey, "00:00");
  const cutoff = addHours(new Date(), -6);
  const entries = await prisma.waitlistEntry.findMany({
    where: {
      date: day,
      OR: [{ notifiedAt: null }, { notifiedAt: { lt: cutoff } }],
    },
  });

  const bookUrl = `${getAppUrl()}/book`;
  const dateLabel = formatInTimeZone(parseLondon(dateKey, "12:00"), BOOKING_TIMEZONE, "EEEE d MMMM");

  for (const entry of entries) {
    await sendWaitlistOpenedEmail({
      name: entry.name,
      email: entry.email,
      dateLabel,
      bookUrl,
    });
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { notifiedAt: new Date() },
    });
  }

  return entries.length;
}
