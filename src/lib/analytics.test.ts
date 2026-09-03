import { describe, expect, it } from "vitest";
import { summariseAnalytics } from "@/lib/analytics";

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
});
