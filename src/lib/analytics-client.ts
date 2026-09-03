import { isAnalyticsEventName, type AnalyticsEventName } from "@/lib/analytics";

const SESSION_KEY = "gundog-analytics-session";

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      return existing;
    }
    const next = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return "";
  }
}

export function trackClientEvent(
  name: AnalyticsEventName,
  extra?: { path?: string; label?: string },
) {
  if (typeof window === "undefined" || !isAnalyticsEventName(name)) {
    return;
  }

  const payload = {
    name,
    path: extra?.path ?? window.location.pathname,
    label: extra?.label,
    sessionId: getAnalyticsSessionId(),
  };

  try {
    const body = JSON.stringify(payload);
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics", blob)) {
      return;
    }
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Analytics must never block booking.
  }
}
