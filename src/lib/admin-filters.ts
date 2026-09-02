import type { BookingStatus } from "@prisma/client";

export const bookingStatusFilters = ["all", "pending_payment", "confirmed", "cancelled"] as const;
export const bookingWhenFilters = ["all", "today", "upcoming", "past"] as const;

export type BookingStatusFilter = (typeof bookingStatusFilters)[number];
export type BookingWhenFilter = (typeof bookingWhenFilters)[number];

export type AdminBookingFilters = {
  status: BookingStatusFilter;
  when: BookingWhenFilter;
};

export function parseAdminBookingFilters(input: {
  status?: string;
  when?: string;
}): AdminBookingFilters {
  return {
    status: bookingStatusFilters.includes(input.status as BookingStatusFilter)
      ? (input.status as BookingStatusFilter)
      : "all",
    when: bookingWhenFilters.includes(input.when as BookingWhenFilter)
      ? (input.when as BookingWhenFilter)
      : "all",
  };
}

export function bookingStatusWhere(status: BookingStatusFilter): BookingStatus | undefined {
  return status === "all" ? undefined : status;
}
