import Link from "next/link";
import { notFound } from "next/navigation";
import { saveBookingNotesAction } from "@/app/admin/(dashboard)/bookings/actions";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { CancelBookingButton } from "@/components/admin/cancel-booking-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_TIMEZONE } from "@/lib/availability";
import { formatDuration, formatPricePence, formatServiceType } from "@/lib/format";
import { intakeRows } from "@/lib/intake-display";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      client: true,
      dog: true,
      service: true,
      documents: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const extraPdfs = await prisma.document.findMany({
    where: {
      OR: [
        { bookingId: booking.id },
        { clientId: booking.clientId, type: "intake_pdf", storagePath: { contains: booking.dogId } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  const documents = uniqueById([...booking.documents, ...extraPdfs]);
  const answers = intakeRows(booking.dog.intakeData);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/bookings" className="hover:text-foreground hover:underline">
              Bookings
            </Link>
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "EEEE d MMMM yyyy")}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "HH:mm")} · {booking.service.name}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Type · </span>
              {formatServiceType(booking.meetingType)} · {formatDuration(booking.service.durationMinutes)}
            </p>
            <p>
              <span className="text-muted-foreground">Price · </span>
              {formatPricePence(booking.service.pricePence)}
            </p>
            {booking.address ? (
              <p>
                <span className="text-muted-foreground">Address · </span>
                {booking.address}
              </p>
            ) : null}
            <p>
              <span className="text-muted-foreground">Stripe session · </span>
              {booking.stripeSessionId ?? "Not started"}
            </p>
            <p>
              <span className="text-muted-foreground">Payment · </span>
              {booking.stripePaymentIntentId ?? "Not paid"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client and dog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <Link href={`/admin/clients/${booking.clientId}`} className="font-medium text-primary hover:underline">
                {booking.client.name}
              </Link>
            </p>
            <p>
              <a className="text-primary hover:underline" href={`mailto:${booking.client.email}`}>
                {booking.client.email}
              </a>
            </p>
            {booking.client.phone ? <p>{booking.client.phone}</p> : null}
            <p>
              <span className="text-muted-foreground">Dog · </span>
              {booking.dog.name}
              {booking.dog.breed ? ` · ${booking.dog.breed}` : ""}
              {booking.dog.age ? ` · ${booking.dog.age} yrs` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">Intake</h3>
        {answers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No intake answers stored for this dog.</p>
        ) : (
          <dl className="divide-y rounded-xl border bg-card">
            {answers.map((row) => (
              <div key={row.label} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-3">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="sm:col-span-2">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Documents</h3>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files on this booking yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>{document.filename}</span>
                <Link className="text-primary hover:underline" href={`/admin/documents/${document.id}/file`}>
                  Download
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Trainer notes</h3>
        <form action={saveBookingNotesAction} className="space-y-3 rounded-xl border bg-card p-4">
          <input type="hidden" name="bookingId" value={booking.id} />
          <Label htmlFor="notes" className="sr-only">
            Notes
          </Label>
          <Textarea id="notes" name="notes" defaultValue={booking.notes ?? ""} maxLength={2000} />
          <Button type="submit">Save notes</Button>
        </form>
      </section>

      {booking.status !== "cancelled" ? <CancelBookingButton bookingId={booking.id} /> : null}
    </div>
  );
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}
