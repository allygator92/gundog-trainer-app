import { Resend } from "resend";
import { site } from "@content/site";
import { paragraphsToHtml, wrapEmailHtml } from "@/lib/email-html";

let resendClient: Resend | null = null;

export function isResendConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  return Boolean(apiKey && apiKey.startsWith("re_") && apiKey !== "re_...");
}

export function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "Gundog Trainer <onboarding@resend.dev>";
}

export function getTrainerEmail(): string {
  return process.env.TRAINER_NOTIFICATION_EMAIL ?? site.email;
}

export async function sendContactNotification(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<boolean> {
  if (!isResendConfigured()) {
    console.warn("Resend is not configured; contact email was skipped.");
    return false;
  }

  const { error } = await getResend().emails.send({
    from: getFromEmail(),
    to: getTrainerEmail(),
    replyTo: input.email,
    subject: `New enquiry from ${input.name}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone ?? "Not provided"}`,
      "",
      input.message,
    ].join("\n"),
    html: wrapEmailHtml(
      `New enquiry from ${input.name}`,
      paragraphsToHtml([
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone ?? "Not provided"}`,
        input.message,
      ]),
    ),
  });

  if (error) {
    console.error("Failed to send contact email:", error);
    return false;
  }

  return true;
}

export async function sendIntakeNotification(input: {
  ownerName: string;
  ownerEmail: string;
  dogName: string;
}): Promise<boolean> {
  if (!isResendConfigured()) {
    console.warn("Resend is not configured; intake email was skipped.");
    return false;
  }

  const { error } = await getResend().emails.send({
    from: getFromEmail(),
    to: getTrainerEmail(),
    replyTo: input.ownerEmail,
    subject: `New intake: ${input.dogName} / ${input.ownerName}`,
    text: [
      "A new dog intake has been submitted.",
      "",
      `Owner: ${input.ownerName}`,
      `Email: ${input.ownerEmail}`,
      `Dog: ${input.dogName}`,
      "",
      "The intake PDF is in the admin dashboard under Intakes.",
    ].join("\n"),
    html: wrapEmailHtml(
      "New dog intake",
      paragraphsToHtml([
        "A new dog intake has been submitted.",
        `Owner: ${input.ownerName}`,
        `Email: ${input.ownerEmail}`,
        `Dog: ${input.dogName}`,
        "The intake PDF is in the admin dashboard under Intakes.",
      ]),
    ),
  });

  if (error) {
    console.error("Failed to send intake email:", error);
    return false;
  }

  return true;
}

export async function sendBookingConfirmationEmails(input: {
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
}): Promise<boolean> {
  if (!isResendConfigured()) {
    console.warn("Resend is not configured; booking emails were skipped.");
    return false;
  }

  const { buildBookingEmailCopy } = await import("@/lib/booking-email");
  const copy = buildBookingEmailCopy(input);
  const resend = getResend();
  const from = getFromEmail();

  const [clientResult, trainerResult] = await Promise.all([
    resend.emails.send({
      from,
      to: copy.client.to,
      subject: copy.client.subject,
      text: copy.client.text,
      html: copy.client.html,
    }),
    resend.emails.send({
      from,
      to: getTrainerEmail(),
      replyTo: input.clientEmail,
      subject: copy.trainer.subject,
      text: copy.trainer.text,
      html: copy.trainer.html,
    }),
  ]);

  if (clientResult.error || trainerResult.error) {
    console.error("Failed to send booking emails:", clientResult.error ?? trainerResult.error);
    return false;
  }

  return true;
}

async function sendPreparedEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  if (!isResendConfigured()) {
    console.warn("Resend is not configured; email was skipped.");
    return false;
  }
  const { error } = await getResend().emails.send({
    from: getFromEmail(),
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  if (error) {
    console.error("Failed to send email:", error);
    return false;
  }
  return true;
}

export async function sendBookingReminderEmail(
  input: Parameters<typeof sendBookingConfirmationEmails>[0],
): Promise<boolean> {
  const { buildReminderEmailCopy } = await import("@/lib/booking-email");
  return sendPreparedEmail(buildReminderEmailCopy(input));
}

export async function sendBookingCancelledEmail(input: {
  clientName: string;
  clientEmail: string;
  dogName: string;
  when: string;
  bookUrl: string;
}): Promise<boolean> {
  const { buildCancelledEmailCopy } = await import("@/lib/booking-email");
  return sendPreparedEmail(buildCancelledEmailCopy(input));
}

export async function sendWaitlistOpenedEmail(input: {
  name: string;
  email: string;
  dateLabel: string;
  bookUrl: string;
}): Promise<boolean> {
  const { buildWaitlistOpenedCopy } = await import("@/lib/booking-email");
  return sendPreparedEmail(buildWaitlistOpenedCopy(input));
}

export async function sendWaitlistJoinedNotification(input: {
  name: string;
  email: string;
  dateLabel: string;
}): Promise<boolean> {
  return sendPreparedEmail({
    to: getTrainerEmail(),
    replyTo: input.email,
    subject: `Waitlist: ${input.name} for ${input.dateLabel}`,
    text: `${input.name} <${input.email}> joined the waitlist for ${input.dateLabel}.`,
    html: wrapEmailHtml(
      "New waitlist request",
      paragraphsToHtml([`${input.name} <${input.email}> joined the waitlist for ${input.dateLabel}.`]),
    ),
  });
}

