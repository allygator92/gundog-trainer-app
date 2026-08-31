import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BOOKING_TIMEZONE } from "@/lib/availability";
import { formatBookingStatus } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [confirmedUpcoming, pendingPayment, recentDogs, recentEnquiries, upcomingBookings] =
    await Promise.all([
      prisma.booking.count({
        where: { status: "confirmed", startsAt: { gte: new Date() } },
      }),
      prisma.booking.count({ where: { status: "pending_payment" } }),
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
        where: { status: { in: ["confirmed", "pending_payment"] }, startsAt: { gte: new Date() } },
        include: { client: true, dog: true, service: true },
        orderBy: { startsAt: "asc" },
        take: 5,
      }),
    ]);

  const sections = [
    {
      title: "Bookings",
      description: `${confirmedUpcoming} upcoming confirmed · ${pendingPayment} awaiting payment`,
      href: "/admin/bookings",
    },
    {
      title: "Availability",
      description: "Weekly hours and blocked dates.",
      href: "/admin/availability",
    },
    {
      title: "Intakes",
      description: "Dog intake forms and private PDF downloads.",
      href: "/admin/intakes",
    },
    {
      title: "Enquiries",
      description: "Contact form messages from the public site.",
      href: "/admin/enquiries",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Overview</h2>
        <p className="mt-1 text-muted-foreground">Upcoming sessions, recent intakes, and enquiries.</p>
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
          <h3 className="font-semibold">Next sessions</h3>
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {upcomingBookings.map((booking) => (
                <li key={booking.id} className="px-4 py-3 text-sm">
                  <p className="font-medium">
                    {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "EEE d MMM, HH:mm")}
                  </p>
                  <p className="text-muted-foreground">
                    {booking.dog.name} · {booking.service.name}
                  </p>
                  <p className="text-muted-foreground">{formatBookingStatus(booking.status)}</p>
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
                  <p className="font-medium">
                    {dog.name} · {dog.client.name}
                  </p>
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
                  <p className="font-medium">{enquiry.name}</p>
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
