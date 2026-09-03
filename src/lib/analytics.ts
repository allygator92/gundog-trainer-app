export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "booking_service_selected",
  "booking_slot_selected",
  "intake_completed",
  "checkout_clicked",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export const BOOKING_FUNNEL = [
  { name: "booking_viewed" as const, label: "Opened booking" },
  { name: "booking_service_selected" as const, label: "Chose a session" },
  { name: "booking_slot_selected" as const, label: "Picked a time" },
  { name: "intake_completed" as const, label: "Finished intake" },
  { name: "checkout_clicked" as const, label: "Started payment" },
] as const;

export type FunnelStepName = (typeof BOOKING_FUNNEL)[number]["name"];

export type AnalyticsEventRow = {
  name: string;
  path: string | null;
  sessionId: string | null;
  label: string | null;
  createdAt: Date;
};

export type BookingStatusCount = {
  status: "pending_payment" | "confirmed" | "cancelled";
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENT_NAMES as readonly string[]).includes(value);
}

function uniqueSessions(
  events: AnalyticsEventRow[],
  predicate: (event: AnalyticsEventRow) => boolean,
) {
  const ids = new Set<string>();
  for (const event of events) {
    if (!event.sessionId || !predicate(event)) {
      continue;
    }
    ids.add(event.sessionId);
  }
  return ids.size;
}

function isBookPath(path: string | null) {
  return path === "/book" || Boolean(path?.startsWith("/book?"));
}

export function summariseAnalytics(
  events: AnalyticsEventRow[],
  bookings: BookingStatusCount[],
) {
  const pageViews = events.filter((event) => event.name === "page_view");
  const uniqueVisitors = uniqueSessions(pageViews, () => true);

  const pages = new Map<string, { views: number; sessions: Set<string> }>();
  for (const event of pageViews) {
    const path = event.path || "/";
    const current = pages.get(path) ?? { views: 0, sessions: new Set<string>() };
    current.views += 1;
    if (event.sessionId) {
      current.sessions.add(event.sessionId);
    }
    pages.set(path, current);
  }

  const topPages = [...pages.entries()]
    .map(([path, stats]) => ({
      path,
      views: stats.views,
      sessions: stats.sessions.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const funnelCounts: Record<FunnelStepName, number> = {
    booking_viewed: uniqueSessions(events, (event) => event.name === "page_view" && isBookPath(event.path)),
    booking_service_selected: uniqueSessions(events, (event) => event.name === "booking_service_selected"),
    booking_slot_selected: uniqueSessions(events, (event) => event.name === "booking_slot_selected"),
    intake_completed: uniqueSessions(events, (event) => event.name === "intake_completed"),
    checkout_clicked: uniqueSessions(events, (event) => event.name === "checkout_clicked"),
  };

  const funnel = BOOKING_FUNNEL.map((step, index) => {
    const count = funnelCounts[step.name];
    const previous = index === 0 ? count : funnelCounts[BOOKING_FUNNEL[index - 1].name];
    const conversion = previous === 0 ? 0 : count / previous;
    const dropOff = index === 0 ? 0 : Math.max(0, 1 - conversion);
    return {
      ...step,
      count,
      conversion,
      dropOff,
    };
  });

  const confirmed = bookings.filter((booking) => booking.status === "confirmed").length;
  const pending = bookings.filter((booking) => booking.status === "pending_payment").length;
  const cancelled = bookings.filter((booking) => booking.status === "cancelled").length;
  const startedCheckout = confirmed + pending + cancelled;
  const paidRate = startedCheckout === 0 ? 0 : confirmed / startedCheckout;

  return {
    pageViews: pageViews.length,
    uniqueVisitors,
    topPages,
    funnel,
    payments: {
      startedCheckout,
      confirmed,
      pending,
      cancelled,
      paidRate,
      abandonedRate: startedCheckout === 0 ? 0 : (pending + cancelled) / startedCheckout,
    },
  };
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
