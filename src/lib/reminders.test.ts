import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseLondon } from "@/lib/availability-slots";

const { findMany, update, sendBookingReminderEmail, isResendConfigured } = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
  sendBookingReminderEmail: vi.fn(),
  isResendConfigured: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findMany,
      update,
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendBookingReminderEmail,
  isResendConfigured,
}));

vi.mock("@/lib/app-url", () => ({
  getAppUrl: () => "https://example.com",
}));

vi.mock("@/lib/booking-manage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/booking-manage")>();
  return {
    ...actual,
    getVirtualMeetingUrl: () => "https://meet.example/room",
  };
});

import { sendDueReminders } from "@/lib/reminders";

const booking = {
  id: "booking_1",
  manageToken: "token_1",
  meetingType: "virtual" as const,
  startsAt: parseLondon("2026-09-07", "10:00"),
  address: null,
  client: { name: "Sam Owner", email: "sam@example.com" },
  dog: { name: "Moss" },
  service: { name: "Virtual Training Session", durationMinutes: 60, pricePence: 6500 },
};

describe("sendDueReminders", () => {
  const now = parseLondon("2026-09-06", "10:00");

  beforeEach(() => {
    vi.clearAllMocks();
    update.mockResolvedValue({});
    sendBookingReminderEmail.mockResolvedValue(true);
    isResendConfigured.mockReturnValue(true);
  });

  it("sends a reminder for confirmed sessions tomorrow and marks them sent", async () => {
    findMany.mockResolvedValue([booking]);

    const result = await sendDueReminders(now);

    expect(result).toEqual({ sent: 1, dateKey: "2026-09-07" });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "confirmed",
          reminderSentAt: null,
        }),
      }),
    );
    expect(sendBookingReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        clientEmail: "sam@example.com",
        dogName: "Moss",
        manageUrl: "https://example.com/booking/token_1",
        meetingUrl: "https://meet.example/room",
      }),
    );
    expect(update).toHaveBeenCalledWith({
      where: { id: "booking_1" },
      data: { reminderSentAt: expect.any(Date) },
    });
  });

  it("creates a manage token when the booking does not have one yet", async () => {
    findMany.mockResolvedValue([{ ...booking, manageToken: null }]);

    await sendDueReminders(now);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "booking_1" },
        data: { manageToken: expect.stringMatching(/^[0-9a-f]{48}$/) },
      }),
    );
    expect(sendBookingReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        manageUrl: expect.stringMatching(/^https:\/\/example.com\/booking\/[0-9a-f]{48}$/),
      }),
    );
  });

  it("still records the send when Resend is not configured", async () => {
    findMany.mockResolvedValue([booking]);
    sendBookingReminderEmail.mockResolvedValue(false);
    isResendConfigured.mockReturnValue(false);

    const result = await sendDueReminders(now);

    expect(result.sent).toBe(1);
    expect(update).toHaveBeenCalledWith({
      where: { id: "booking_1" },
      data: { reminderSentAt: expect.any(Date) },
    });
  });

  it("does not mark a booking sent when the email fails and Resend is on", async () => {
    findMany.mockResolvedValue([booking]);
    sendBookingReminderEmail.mockResolvedValue(false);
    isResendConfigured.mockReturnValue(true);

    const result = await sendDueReminders(now);

    expect(result.sent).toBe(0);
    expect(update).not.toHaveBeenCalled();
  });
});
