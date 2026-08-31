import { Resend } from "resend";
import { site } from "@content/site";

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
  });

  if (error) {
    console.error("Failed to send intake email:", error);
    return false;
  }

  return true;
}
