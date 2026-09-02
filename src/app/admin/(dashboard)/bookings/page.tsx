import Link from "next/link";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { Button } from "@/components/ui/button";
import { BOOKING_TIMEZONE, londonDay, parseLondon } from "@/lib/availability";
import { bookingStatusWhere, parseAdminBookingFilters } from "@/lib/admin-filters";
import { formatPricePence, formatServiceType } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; when?: string }>;
}) {
  const filters = parseAdminBookingFilters(await searchParams);
  const now = new Date();
  const todayKey = londonDay(now);
  const todayStart = parseLondon(todayKey, "00:00");
  const todayEnd = addMinutes(todayStart, 24 * 60);
  const status = bookingStatusWhere(filters.status);

  const bookings = await prisma.booking.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(filters.when === "upcoming" ? { startsAt: { gte: now } } : {}),
      ...(filters.when === "past" ? { startsAt: { lt: now } } : {}),
      ...(filters.when === "today" ? { startsAt: { gte: todayStart, lt: todayEnd } } : {}),
    },
    include: {
      client: true,
      dog: true,
      service: true,
    },
    orderBy: { startsAt: filters.when === "upcoming" || filters.when === "today" ? "asc" : "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
        <p className="mt-1 text-muted-foreground">
          Pending payment holds a slot for 30 minutes. Confirmed sessions stay in the diary.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Status</span>
          <select
            name="status"
            defaultValue={filters.status}
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending_payment">Pending payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">When</span>
          <select
            name="when"
            defaultValue={filters.when}
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Any date</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </label>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookings match those filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Dog</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/admin/bookings/${booking.id}`} className="font-medium hover:underline">
                      {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "EEE d MMM yyyy")}
                    </Link>
                    <div className="text-muted-foreground">
                      {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "HH:mm")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${booking.clientId}`} className="hover:underline">
                      {booking.client.name}
                    </Link>
                    <div className="text-muted-foreground">{booking.client.email}</div>
                  </td>
                  <td className="px-4 py-3">{booking.dog.name}</td>
                  <td className="px-4 py-3">
                    <div>{booking.service.name}</div>
                    <div className="text-muted-foreground">
                      {formatServiceType(booking.meetingType)} · {formatPricePence(booking.service.pricePence)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {booking.stripePaymentIntentId ? "Paid" : booking.stripeSessionId ? "Checkout started" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
