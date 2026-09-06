import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseLondon } from "@/lib/availability-slots";
import { utcNoonFromDateKey } from "@/lib/calendar-grid";

const { findMany, update, sendWaitlistOpenedEmail } = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
  sendWaitlistOpenedEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    waitlistEntry: {
      findMany,
      update,
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendWaitlistOpenedEmail,
}));

vi.mock("@/lib/app-url", () => ({
  getAppUrl: () => "https://example.com",
}));

import { notifyWaitlistForDate } from "@/lib/waitlist";

describe("notifyWaitlistForDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendWaitlistOpenedEmail.mockResolvedValue(true);
    update.mockResolvedValue({});
  });

  it("emails people waiting for that London day and records the send", async () => {
    findMany.mockResolvedValue([
      { id: "w1", name: "Sam", email: "sam@example.com" },
      { id: "w2", name: "Jo", email: "jo@example.com" },
    ]);

    const date = parseLondon("2026-09-07", "10:00");
    const sent = await notifyWaitlistForDate(date);

    expect(sent).toBe(2);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: utcNoonFromDateKey("2026-09-07"),
        }),
      }),
    );
    expect(sendWaitlistOpenedEmail).toHaveBeenCalledTimes(2);
    expect(sendWaitlistOpenedEmail).toHaveBeenCalledWith({
      name: "Sam",
      email: "sam@example.com",
      dateLabel: "Monday 7 September",
      bookUrl: "https://example.com/book",
    });
    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "w1" },
        data: expect.objectContaining({ notifiedAt: expect.any(Date) }),
      }),
    );
  });

  it("returns zero when nobody is waiting", async () => {
    findMany.mockResolvedValue([]);
    expect(await notifyWaitlistForDate(parseLondon("2026-09-07", "10:00"))).toBe(0);
    expect(sendWaitlistOpenedEmail).not.toHaveBeenCalled();
  });
});
