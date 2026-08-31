import { BOOKING_TIMEZONE } from "@/lib/availability";
import { formatBookingStatus, formatPricePence, formatServiceType } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      client: true,
      dog: true,
      service: true,
    },
    orderBy: { startsAt: "desc" },
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
      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Dog</th>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div>{formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "EEE d MMM yyyy")}</div>
                    <div className="text-muted-foreground">
                      {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "HH:mm")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{booking.client.name}</div>
                    <div className="text-muted-foreground">{booking.client.email}</div>
                  </td>
                  <td className="px-4 py-3">{booking.dog.name}</td>
                  <td className="px-4 py-3">
                    <div>{booking.service.name}</div>
                    <div className="text-muted-foreground">
                      {formatServiceType(booking.meetingType)} · {formatPricePence(booking.service.pricePence)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatBookingStatus(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
