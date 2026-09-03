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
  manageUrl?: string;
  meetingUrl?: string;
};

export function formatBookingWhen(startsAt: Date) {
  return `${formatInTimeZone(startsAt, BOOKING_TIMEZONE, "EEEE d MMMM yyyy")} at ${formatInTimeZone(
    startsAt,
    BOOKING_TIMEZONE,
    "HH:mm",
  )}`;
}

function locationLine(input: BookingEmailInput) {
  if (input.meetingType !== "virtual") {
    return `I’ll come to ${input.address ?? "the address on your intake"}.`;
  }
  if (input.meetingUrl) {
    return `Video call: ${input.meetingUrl}`;
  }
  return site.virtualMeetingNote;
}

function manageLine(manageUrl?: string) {
  return manageUrl
    ? `Need to cancel or pick another time? ${manageUrl}`
    : "If you need to change this, reply to this email.";
}

export function buildBookingEmailCopy(input: BookingEmailInput) {
  const when = formatBookingWhen(input.startsAt);
  const sessionLine = `${input.serviceName} (${formatServiceType(input.meetingType)}, ${formatDuration(input.durationMinutes)})`;
  const location = locationLine(input);
  const changeLine = manageLine(input.manageUrl);

  const clientLines = [
    `Hi ${input.clientName},`,
    `You’re booked in for ${sessionLine}.`,
    `When: ${when}`,
    `Dog: ${input.dogName}`,
    `Total: ${formatPricePence(input.pricePence)}`,
    location,
    changeLine,
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
        location,
        "",
        changeLine,
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

export function buildReminderEmailCopy(input: BookingEmailInput) {
  const when = formatBookingWhen(input.startsAt);
  const location = locationLine(input);
  const bring =
    input.meetingType === "in_person"
      ? "Please bring a slip lead (or your usual lead), water for the dog, and weather-proof clothing. I’ll bring dummies and other kit."
      : "Have your dog somewhere you can work for the hour, and a lead ready.";
  const lines = [
    `Hi ${input.clientName},`,
    `A reminder that ${input.dogName} is booked in tomorrow.`,
    `When: ${when}`,
    `Session: ${input.serviceName}`,
    location,
    bring,
    manageLine(input.manageUrl),
    site.name,
  ];

  return {
    to: input.clientEmail,
    subject: `Reminder: ${input.dogName} tomorrow at ${formatInTimeZone(input.startsAt, BOOKING_TIMEZONE, "HH:mm")}`,
    text: lines.join("\n\n"),
    html: wrapEmailHtml("Session tomorrow", paragraphsToHtml(lines)),
  };
}

export function buildCancelledEmailCopy(input: {
  clientName: string;
  clientEmail: string;
  dogName: string;
  when: string;
  bookUrl: string;
}) {
  const lines = [
    `Hi ${input.clientName},`,
    `Your session for ${input.dogName} on ${input.when} has been cancelled.`,
    `If you want another time, you can book again here: ${input.bookUrl}`,
    site.name,
  ];
  return {
    to: input.clientEmail,
    subject: `Booking cancelled: ${input.dogName}`,
    text: lines.join("\n\n"),
    html: wrapEmailHtml("Booking cancelled", paragraphsToHtml(lines)),
  };
}

export function buildWaitlistOpenedCopy(input: {
  name: string;
  email: string;
  dateLabel: string;
  bookUrl: string;
}) {
  const lines = [
    `Hi ${input.name},`,
    `A time has opened on ${input.dateLabel}. If you still want it, book it here before someone else does: ${input.bookUrl}`,
    site.name,
  ];
  return {
    to: input.email,
    subject: `A training time has opened on ${input.dateLabel}`,
    text: lines.join("\n\n"),
    html: wrapEmailHtml("A time has opened", paragraphsToHtml(lines)),
  };
}
