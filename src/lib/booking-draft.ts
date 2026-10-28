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

export function saveBookingDraft(draft: BookingDraft) {
  sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearBookingDraft() {
  sessionStorage.removeItem(BOOKING_DRAFT_KEY);
}
