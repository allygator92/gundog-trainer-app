import { addMinutes } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  buildAvailableSlots,
  defaultWeeklyHours,
  occupiedWindow,
  parseLondon,
  rulesFromDayHours,
} from "@/lib/availability-slots";

const weekdayNineToFive = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "09:00",
  endTime: "17:00",
}));

describe("defaultWeeklyHours", () => {
  it("fills inactive weekend days with default times", () => {
    const hours = defaultWeeklyHours([
      { dayOfWeek: 1, startTime: "10:00", endTime: "16:00", isActive: true },
    ]);
    expect(hours[0]).toMatchObject({ label: "Monday", isActive: true, startTime: "10:00" });
    expect(hours[5]).toMatchObject({ label: "Saturday", isActive: false, startTime: "09:00", hasBreak: false });
  });

  it("reconstructs a lunch break from two windows on the same day", () => {
    const hours = defaultWeeklyHours([
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00", isActive: true },
      { dayOfWeek: 1, startTime: "13:00", endTime: "17:00", isActive: true },
    ]);
    expect(hours[0]).toMatchObject({
      hasBreak: true,
      startTime: "09:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
      endTime: "17:00",
    });
  });
});

describe("buildAvailableSlots", () => {
  it("offers hourly weekday slots in London time", () => {
    const slots = buildAvailableSlots({
      now: parseLondon("2026-09-01", "08:00"),
      durationMinutes: 60,
      rules: weekdayNineToFive,
      daysAhead: 0,
    });

    expect(slots.map((slot) => slot.label)).toEqual([
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ]);
    expect(slots[0]?.dateLabel).toBe("Tue 1 Sep");
    expect(slots[0]?.dateKey).toBe("2026-09-01");
  });

  it("skips blocked days", () => {
    const slots = buildAvailableSlots({
      now: parseLondon("2026-09-01", "08:00"),
      durationMinutes: 60,
      rules: weekdayNineToFive,
      blockedDays: ["2026-09-01"],
      daysAhead: 0,
    });
    expect(slots).toEqual([]);
  });

  it("does not offer a slot that overlaps an existing booking", () => {
    const occupiedStart = parseLondon("2026-09-01", "10:00");
    const slots = buildAvailableSlots({
      now: parseLondon("2026-09-01", "08:00"),
      durationMinutes: 60,
      rules: weekdayNineToFive,
      occupied: [{ start: occupiedStart, end: addMinutes(occupiedStart, 60) }],
      daysAhead: 0,
    });

    expect(slots.map((slot) => slot.label)).not.toContain("10:00");
    expect(slots.map((slot) => slot.label)).toContain("09:00");
    expect(slots.map((slot) => slot.label)).toContain("11:00");
  });

  it("hides slots that start within the lead time", () => {
    const slots = buildAvailableSlots({
      now: parseLondon("2026-09-01", "09:30"),
      durationMinutes: 60,
      rules: weekdayNineToFive,
      daysAhead: 0,
      leadMinutes: 60,
    });

    expect(slots.map((slot) => slot.label)).not.toContain("09:00");
    expect(slots.map((slot) => slot.label)).not.toContain("10:00");
    expect(slots.map((slot) => slot.label)).toContain("11:00");
  });

  it("does not offer slots that fall inside a lunch break window", () => {
    const monday = defaultWeeklyHours([])[0];
    const withBreak = {
      ...monday,
      isActive: true,
      startTime: "09:00",
      endTime: "17:00",
      hasBreak: true,
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    };

    const slots = buildAvailableSlots({
      now: parseLondon("2026-09-01", "08:00"),
      durationMinutes: 60,
      rules: rulesFromDayHours({ ...withBreak, dayOfWeek: 2 }),
      daysAhead: 0,
    });

    expect(slots.map((slot) => slot.label)).toContain("11:00");
    expect(slots.map((slot) => slot.label)).not.toContain("12:00");
    expect(slots.map((slot) => slot.label)).toContain("13:00");
  });

  it("keeps a travel buffer around in-person bookings", () => {
    const occupiedStart = parseLondon("2026-09-01", "10:00");
    const slots = buildAvailableSlots({
      now: parseLondon("2026-09-01", "08:00"),
      durationMinutes: 60,
      rules: weekdayNineToFive,
      occupied: [occupiedWindow(occupiedStart, 60, "in_person")],
      daysAhead: 0,
    });

    expect(slots.map((slot) => slot.label)).not.toContain("09:00");
    expect(slots.map((slot) => slot.label)).not.toContain("10:00");
    expect(slots.map((slot) => slot.label)).not.toContain("11:00");
    expect(slots.map((slot) => slot.label)).toContain("12:00");
  });
});
