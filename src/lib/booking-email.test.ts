import { describe, expect, it } from "vitest";
import { buildBookingEmailCopy, formatBookingWhen } from "@/lib/booking-email";
import { parseLondon } from "@/lib/availability-slots";

describe("buildBookingEmailCopy", () => {
  const startsAt = parseLondon("2026-09-01", "10:00");

  it("includes the London time and virtual meeting note for the client", () => {
    const copy = buildBookingEmailCopy({
      clientName: "Sam Owner",
      clientEmail: "sam@example.com",
      dogName: "Moss",
      serviceName: "Virtual Training Session",
      meetingType: "virtual",
      startsAt,
      durationMinutes: 60,
      pricePence: 6500,
    });

    expect(formatBookingWhen(startsAt)).toContain("10:00");
    expect(copy.client.to).toBe("sam@example.com");
    expect(copy.client.subject).toContain("Moss");
    expect(copy.client.text).toContain("£65.00");
    expect(copy.client.text).toContain("video call link");
    expect(copy.trainer.subject).toContain("Moss");
    expect(copy.trainer.text).toContain("sam@example.com");
  });

  it("includes the visit address for in-person sessions", () => {
    const copy = buildBookingEmailCopy({
      clientName: "Sam Owner",
      clientEmail: "sam@example.com",
      dogName: "Moss",
      serviceName: "In-Person Training Session",
      meetingType: "in_person",
      startsAt,
      durationMinutes: 90,
      pricePence: 9500,
      address: "10 Field Lane, York",
    });

    expect(copy.client.text).toContain("10 Field Lane, York");
    expect(copy.trainer.text).toContain("10 Field Lane, York");
  });
});
