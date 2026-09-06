import { afterEach, describe, expect, it } from "vitest";
import { site } from "@content/site";
import { getFromEmail, getTrainerEmail, isResendConfigured } from "@/lib/email";

describe("isResendConfigured", () => {
  const original = process.env.RESEND_API_KEY;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = original;
    }
  });

  it("is false for a missing, placeholder, or non-Resend key", () => {
    delete process.env.RESEND_API_KEY;
    expect(isResendConfigured()).toBe(false);

    process.env.RESEND_API_KEY = "re_...";
    expect(isResendConfigured()).toBe(false);

    process.env.RESEND_API_KEY = "sk_test_not_resend";
    expect(isResendConfigured()).toBe(false);
  });

  it("is true for a real-looking Resend key", () => {
    process.env.RESEND_API_KEY = "re_live_example";
    expect(isResendConfigured()).toBe(true);
  });
});

describe("getFromEmail", () => {
  const original = process.env.RESEND_FROM_EMAIL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.RESEND_FROM_EMAIL;
    } else {
      process.env.RESEND_FROM_EMAIL = original;
    }
  });

  it("uses the configured from address", () => {
    process.env.RESEND_FROM_EMAIL = "Gundog Trainer <bookings@example.com>";
    expect(getFromEmail()).toBe("Gundog Trainer <bookings@example.com>");
  });

  it("falls back to Resend’s onboarding address", () => {
    delete process.env.RESEND_FROM_EMAIL;
    expect(getFromEmail()).toBe("Gundog Trainer <onboarding@resend.dev>");
  });
});

describe("getTrainerEmail", () => {
  const original = process.env.TRAINER_NOTIFICATION_EMAIL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.TRAINER_NOTIFICATION_EMAIL;
    } else {
      process.env.TRAINER_NOTIFICATION_EMAIL = original;
    }
  });

  it("uses the configured trainer inbox", () => {
    process.env.TRAINER_NOTIFICATION_EMAIL = "trainer@example.com";
    expect(getTrainerEmail()).toBe("trainer@example.com");
  });

  it("falls back to the site contact email", () => {
    delete process.env.TRAINER_NOTIFICATION_EMAIL;
    expect(getTrainerEmail()).toBe(site.email);
  });
});
