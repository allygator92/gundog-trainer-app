import { addDays } from "date-fns";
import { getAppUrl } from "@/lib/app-url";
import { londonDay, parseLondon } from "@/lib/availability-slots";
import { createManageToken, getVirtualMeetingUrl, manageBookingUrl } from "@/lib/booking-manage";
import { isResendConfigured, sendBookingReminderEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function sendDueReminders(now = new Date()) {
  const tomorrowKey = londonDay(addDays(parseLondon(londonDay(now), "12:00"), 1));
  const dayStart = parseLondon(tomorrowKey, "00:00");
  const dayEnd = parseLondon(tomorrowKey, "23:59");

  const bookings = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      reminderSentAt: null,
      startsAt: { gte: dayStart, lte: dayEnd },
    },
    include: { client: true, dog: true, service: true },
  });

  const appUrl = getAppUrl();
  let sent = 0;

  for (const booking of bookings) {
    const token = booking.manageToken ?? createManageToken();
    if (!booking.manageToken) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { manageToken: token },
      });
    }

    const ok = await sendBookingReminderEmail({
      clientName: booking.client.name,
      clientEmail: booking.client.email,
      dogName: booking.dog.name,
      serviceName: booking.service.name,
      meetingType: booking.meetingType,
      startsAt: booking.startsAt,
      durationMinutes: booking.service.durationMinutes,
      pricePence: booking.service.pricePence,
      address: booking.address,
      manageUrl: manageBookingUrl(appUrl, token),
      meetingUrl: booking.meetingType === "virtual" ? getVirtualMeetingUrl() : undefined,
    });

    if (ok || !isResendConfigured()) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSentAt: new Date() },
      });
      sent += 1;
    }
  }

  return { sent, dateKey: tomorrowKey };
}
