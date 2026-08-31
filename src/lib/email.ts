import { Resend } from "resend";

let resendClient: Resend | null = null;

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
  return process.env.TRAINER_NOTIFICATION_EMAIL ?? "trainer@example.com";
}
