import { describe, expect, it } from "vitest";
import { bookingStatusWhere, parseAdminBookingFilters } from "@/lib/admin-filters";

describe("parseAdminBookingFilters", () => {
  it("defaults to all bookings", () => {
    expect(parseAdminBookingFilters({})).toEqual({ status: "all", when: "all" });
  });

  it("accepts known filters and ignores junk", () => {
    expect(parseAdminBookingFilters({ status: "confirmed", when: "today" })).toEqual({
      status: "confirmed",
      when: "today",
    });
    expect(parseAdminBookingFilters({ status: "nope", when: "soon" })).toEqual({
      status: "all",
      when: "all",
    });
  });
});

describe("bookingStatusWhere", () => {
  it("omits a Prisma filter when showing every status", () => {
    expect(bookingStatusWhere("all")).toBeUndefined();
    expect(bookingStatusWhere("pending_payment")).toBe("pending_payment");
  });
});
