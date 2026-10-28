export const BOOKING_DRAFT_KEY = "gundog-booking-draft";

export type BookingDraft = {
  serviceId: string;
  startsAt: string;
  dateLabel: string;
  dateKey: string;
  label: string;
  clientId: string;
  dogId: string;
  ownerName: string;
  dogName: string;
};

export function parseBookingDraft(raw: string | null): BookingDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<BookingDraft>;
    if (
      !value.serviceId ||
      !value.startsAt ||
      !value.dateLabel ||
      !value.dateKey ||
      !value.label ||
      !value.clientId ||
      !value.dogId ||
      !value.ownerName ||
      !value.dogName
    ) {
      return null;
    }
    return value as BookingDraft;
  } catch {
    return null;
  }
}

export function readBookingDraft(): BookingDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  return parseBookingDraft(sessionStorage.getItem(BOOKING_DRAFT_KEY));
}

export type BookingDraftSnapshot =
  | { status: "pending" }
  | { status: "empty" }
  | { status: "ready"; draft: BookingDraft };

const pendingDraft: BookingDraftSnapshot = { status: "pending" };
const emptyDraft: BookingDraftSnapshot = { status: "empty" };
const draftListeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSnapshot: BookingDraftSnapshot = emptyDraft;

function notifyDraftListeners() {
  cachedRaw = undefined;
  for (const listener of draftListeners) {
    listener();
  }
}

export function subscribeBookingDraft(onChange: () => void) {
  draftListeners.add(onChange);
  return () => {
    draftListeners.delete(onChange);
  };
}

export function getBookingDraftServerSnapshot(): BookingDraftSnapshot {
  return pendingDraft;
}

export function getBookingDraftSnapshot(): BookingDraftSnapshot {
  if (typeof sessionStorage === "undefined") {
    return emptyDraft;
  }
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
  } catch {
    return emptyDraft;
  }
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }
  cachedRaw = raw;
  const draft = parseBookingDraft(raw);
  cachedSnapshot = draft ? { status: "ready", draft } : emptyDraft;
  return cachedSnapshot;
}

export function saveBookingDraft(draft: BookingDraft) {
  try {
    sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    return;
  }
  notifyDraftListeners();
}

export function clearBookingDraft() {
  try {
    sessionStorage.removeItem(BOOKING_DRAFT_KEY);
  } catch {
    return;
  }
  notifyDraftListeners();
}
