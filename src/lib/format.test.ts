import { describe, expect, it } from "vitest";
import {
  formatBookingStatus,
  formatDuration,
  formatPricePence,
  formatServiceType,
} from "@/lib/format";

describe("formatPricePence", () => {
  it("formats pounds from pence", () => {
    expect(formatPricePence(6500)).toBe("£65.00");
    expect(formatPricePence(95)).toBe("£0.95");
  });
});

describe("formatDuration", () => {
  it("uses hours for multiples of 60", () => {
    expect(formatDuration(60)).toBe("1 hour");
    expect(formatDuration(120)).toBe("2 hours");
  });

  it("uses minutes otherwise", () => {
    expect(formatDuration(90)).toBe("90 minutes");
  });
});

describe("formatServiceType", () => {
  it("labels session types for people", () => {
    expect(formatServiceType("virtual")).toBe("Virtual");
    expect(formatServiceType("in_person")).toBe("In person");
  });
});

describe("formatBookingStatus", () => {
  it("labels booking states", () => {
    expect(formatBookingStatus("pending_payment")).toBe("Pending payment");
    expect(formatBookingStatus("confirmed")).toBe("Confirmed");
    expect(formatBookingStatus("cancelled")).toBe("Cancelled");
  });
});
