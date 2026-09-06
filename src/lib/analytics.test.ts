import { describe, expect, it } from "vitest";
import { isAnalyticsEventName, percent, summariseAnalytics } from "@/lib/analytics";

describe("isAnalyticsEventName", () => {
  it("accepts funnel events and rejects others", () => {
    expect(isAnalyticsEventName("page_view")).toBe(true);
    expect(isAnalyticsEventName("checkout_clicked")).toBe(true);
    expect(isAnalyticsEventName("click")).toBe(false);
  });
});

describe("percent", () => {
  it("rounds a ratio to a whole percent", () => {
    expect(percent(0.5)).toBe("50%");
    expect(percent(0)).toBe("0%");
  });
});

describe("summariseAnalytics", () => {
  it("counts unique booking drop-off and payment outcomes", () => {
    const stats = summariseAnalytics(
      [
        { name: "page_view", path: "/", sessionId: "a", label: null, createdAt: new Date() },
        { name: "page_view", path: "/book", sessionId: "a", label: null, createdAt: new Date() },
        { name: "page_view", path: "/book", sessionId: "b", label: null, createdAt: new Date() },
        { name: "booking_service_selected", path: "/book", sessionId: "a", label: "Virtual", createdAt: new Date() },
        { name: "booking_slot_selected", path: "/book", sessionId: "a", label: "09:00", createdAt: new Date() },
        { name: "intake_completed", path: "/book", sessionId: "a", label: null, createdAt: new Date() },
        { name: "checkout_clicked", path: "/book", sessionId: "a", label: null, createdAt: new Date() },
      ],
      [{ status: "confirmed" }, { status: "cancelled" }],
    );

    expect(stats.uniqueVisitors).toBe(2);
    expect(stats.funnel[0]?.count).toBe(2);
    expect(stats.funnel[1]?.count).toBe(1);
    expect(stats.funnel[1]?.dropOff).toBe(0.5);
    expect(stats.payments.confirmed).toBe(1);
    expect(stats.payments.abandonedRate).toBe(0.5);
    expect(stats.topPages[0]?.path).toBe("/book");
  });

  it("treats an empty diary as zero paid rate rather than NaN", () => {
    const stats = summariseAnalytics([], []);
    expect(stats.uniqueVisitors).toBe(0);
    expect(stats.payments.paidRate).toBe(0);
    expect(stats.payments.abandonedRate).toBe(0);
  });
});
