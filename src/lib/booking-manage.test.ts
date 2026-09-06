import { afterEach, describe, expect, it } from "vitest";
import {
  MANAGE_NOTICE_HOURS,
  canReschedule,
  createManageToken,
  getVirtualMeetingUrl,
  hoursUntilStart,
  manageBookingUrl,
} from "@/lib/booking-manage";

describe("createManageToken", () => {
  it("returns a 48-character hex string", () => {
    const token = createManageToken();
    expect(token).toMatch(/^[0-9a-f]{48}$/);
    expect(createManageToken()).not.toBe(token);
  });
});

describe("manageBookingUrl", () => {
  it("builds the public cancel/reschedule link", () => {
    expect(manageBookingUrl("https://example.com", "abc123")).toBe("https://example.com/booking/abc123");
  });
});

describe("canReschedule", () => {
  const now = new Date("2026-09-06T10:00:00.000Z");

  it("allows a move when the session is at least 24 hours away", () => {
    const startsAt = new Date(now.getTime() + MANAGE_NOTICE_HOURS * 60 * 60 * 1000);
    expect(hoursUntilStart(startsAt, now)).toBe(24);
    expect(canReschedule(startsAt, now)).toBe(true);
  });

  it("blocks a move inside the notice window", () => {
    const startsAt = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    expect(canReschedule(startsAt, now)).toBe(false);
  });
});

describe("getVirtualMeetingUrl", () => {
  const original = process.env.VIRTUAL_MEETING_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.VIRTUAL_MEETING_URL;
    } else {
      process.env.VIRTUAL_MEETING_URL = original;
    }
  });

  it("returns a trimmed meeting URL when set", () => {
    process.env.VIRTUAL_MEETING_URL = "  https://meet.example/room  ";
    expect(getVirtualMeetingUrl()).toBe("https://meet.example/room");
  });

  it("returns an empty string when unset", () => {
    delete process.env.VIRTUAL_MEETING_URL;
    expect(getVirtualMeetingUrl()).toBe("");
  });
});
