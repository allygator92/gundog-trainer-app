import { describe, expect, it } from "vitest";
import { parseBookingDraft } from "@/lib/booking-draft";

const draft = {
  serviceId: "svc",
  startsAt: "2026-10-28T09:00:00.000Z",
  dateLabel: "Wednesday 28 October",
  dateKey: "2026-10-28",
  label: "09:00",
  clientId: "client",
  dogId: "dog",
  ownerName: "Sam",
  dogName: "Moss",
};

describe("parseBookingDraft", () => {
  it("reads a saved booking", () => {
    expect(parseBookingDraft(JSON.stringify(draft))).toEqual(draft);
  });

  it("ignores a partial or broken save", () => {
    expect(parseBookingDraft(null)).toBeNull();
    expect(parseBookingDraft("{")).toBeNull();
    expect(parseBookingDraft(JSON.stringify({ serviceId: "svc" }))).toBeNull();
  });
});
