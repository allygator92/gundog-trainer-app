import Link from "next/link";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BOOKING_TIMEZONE, londonDay, parseLondon } from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = parseLondon(londonDay(now), "00:00");
  const todayEnd = addMinutes(todayStart, 24 * 60);

  const [confirmedUpcoming, pendingPayment, todayCount, recentDogs, recentEnquiries, todayBookings, upcomingBookings] =
    await Promise.all([
      prisma.booking.count({
        where: { status: "confirmed", startsAt: { gte: now } },
      }),
      prisma.booking.count({ where: { status: "pending_payment" } }),
      prisma.booking.count({
        where: {
          status: { in: ["confirmed", "pending_payment"] },
          startsAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      prisma.dog.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.booking.findMany({
        where: {
          status: { in: ["confirmed", "pending_payment"] },
          startsAt: { gte: todayStart, lt: todayEnd },
        },
        include: { client: true, dog: true, service: true },
        orderBy: { startsAt: "asc" },
      }),
      prisma.booking.findMany({
        where: { status: { in: ["confirmed", "pending_payment"] }, startsAt: { gte: now } },
        include: { client: true, dog: true, service: true },
        orderBy: { startsAt: "asc" },
        take: 5,
      }),
    ]);

  const sections = [
    {
      title: "Bookings",
      description: `${todayCount} today · ${confirmedUpcoming} upcoming confirmed · ${pendingPayment} awaiting payment`,
      href: "/admin/bookings",
    },
    {
      title: "Clients",
      description: "Owners, dogs, and private files.",
      href: "/admin/clients",
    },
    {
      title: "Availability",
      description: "Weekly hours and blocked dates.",
      href: "/admin/availability",
    },
    {
      title: "Documents",
      description: "Intake PDFs and extra records.",
      href: "/admin/documents",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Overview</h2>
        <p className="mt-1 text-muted-foreground">Today’s sessions, recent intakes, and enquiries.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="block transition-opacity hover:opacity-90">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary">Open</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-1">
          <h3 className="font-semibold">Today</h3>
          {todayBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing in the diary today.</p>
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {todayBookings.map((booking) => (
                <li key={booking.id} className="px-4 py-3 text-sm">
                  <Link href={`/admin/bookings/${booking.id}`} className="font-medium hover:underline">
                    {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "HH:mm")} · {booking.dog.name}
                  </Link>
                  <p className="text-muted-foreground">{booking.client.name}</p>
                  <BookingStatusBadge status={booking.status} />
                </li>
              ))}
            </ul>
          )}
          <h3 className="pt-4 font-semibold">Next sessions</h3>
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {upcomingBookings.map((booking) => (
                <li key={booking.id} className="px-4 py-3 text-sm">
                  <Link href={`/admin/bookings/${booking.id}`} className="font-medium hover:underline">
                    {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "EEE d MMM, HH:mm")}
                  </Link>
                  <p className="text-muted-foreground">
                    {booking.dog.name} · {booking.service.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Recent intakes</h3>
          {recentDogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No intakes yet.</p>
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {recentDogs.map((dog) => (
                <li key={dog.id} className="px-4 py-3 text-sm">
                  <Link href={`/admin/clients/${dog.clientId}`} className="font-medium hover:underline">
                    {dog.name} · {dog.client.name}
                  </Link>
                  <p className="text-muted-foreground">{dog.createdAt.toLocaleString("en-GB")}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Recent enquiries</h3>
          {recentEnquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {recentEnquiries.map((enquiry) => (
                <li key={enquiry.id} className="px-4 py-3 text-sm">
                  <Link href="/admin/enquiries" className="font-medium hover:underline">
                    {enquiry.name}
                  </Link>
                  <p className="line-clamp-2 text-muted-foreground">{enquiry.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
