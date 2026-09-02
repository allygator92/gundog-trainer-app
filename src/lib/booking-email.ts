import { formatInTimeZone } from "date-fns-tz";
import { site } from "@content/site";
import { BOOKING_TIMEZONE } from "@/lib/availability-slots";
import { paragraphsToHtml, wrapEmailHtml } from "@/lib/email-html";
import { formatDuration, formatPricePence, formatServiceType } from "@/lib/format";

export type BookingEmailInput = {
  clientName: string;
  clientEmail: string;
  dogName: string;
  serviceName: string;
  meetingType: "virtual" | "in_person";
  startsAt: Date;
  durationMinutes: number;
  pricePence: number;
  address?: string | null;
};

export function formatBookingWhen(startsAt: Date) {
  return `${formatInTimeZone(startsAt, BOOKING_TIMEZONE, "EEEE d MMMM yyyy")} at ${formatInTimeZone(
    startsAt,
    BOOKING_TIMEZONE,
    "HH:mm",
  )}`;
}

export function buildBookingEmailCopy(input: BookingEmailInput) {
  const when = formatBookingWhen(input.startsAt);
  const sessionLine = `${input.serviceName} (${formatServiceType(input.meetingType)}, ${formatDuration(input.durationMinutes)})`;
  const locationLine =
    input.meetingType === "virtual"
      ? site.virtualMeetingNote
      : `I’ll come to ${input.address ?? "the address on your intake"}.`;

  const clientLines = [
        `Hi ${input.clientName},`,
        `You’re booked in for ${sessionLine}.`,
        `When: ${when}`,
        `Dog: ${input.dogName}`,
        `Total: ${formatPricePence(input.pricePence)}`,
        locationLine,
        "If you need to change this, reply to this email.",
        site.name,
      ];
  const trainerLines = [
        "A session has been paid and confirmed.",
        `When: ${when}`,
        `Session: ${sessionLine}`,
        `Client: ${input.clientName} <${input.clientEmail}>`,
        `Dog: ${input.dogName}`,
        `Total: ${formatPricePence(input.pricePence)}`,
        input.meetingType === "in_person" ? `Address: ${input.address ?? "Not provided"}` : "Meeting: Virtual",
      ];

  return {
    client: {
      to: input.clientEmail,
      subject: `Booking confirmed: ${input.dogName} on ${formatInTimeZone(input.startsAt, BOOKING_TIMEZONE, "d MMM")}`,
      text: [
        `Hi ${input.clientName},`,
        "",
        `You’re booked in for ${sessionLine}.`,
        `When: ${when}`,
        `Dog: ${input.dogName}`,
        `Total: ${formatPricePence(input.pricePence)}`,
        locationLine,
        "",
        "If you need to change this, reply to this email.",
        "",
        site.name,
      ].join("\n"),
      html: wrapEmailHtml("Booking confirmed", paragraphsToHtml(clientLines)),
    },
    trainer: {
      subject: `New booking: ${input.dogName} / ${input.clientName}`,
      text: trainerLines.join("\n"),
      html: wrapEmailHtml("New paid booking", paragraphsToHtml(trainerLines)),
    },
  };
}
