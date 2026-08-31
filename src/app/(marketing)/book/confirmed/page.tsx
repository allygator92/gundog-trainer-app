import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@content/site";
import { Button } from "@/components/ui/button";
import { BOOKING_TIMEZONE } from "@/lib/availability";
import { formatDuration, formatPricePence } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking received",
};

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;
  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true, dog: true, client: true },
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {booking?.status === "confirmed" ? "You’re booked in" : "Payment received"}
      </h1>
      {booking ? (
        <div className="mt-6 space-y-3 text-muted-foreground">
          <p>
            {booking.service.name} with {booking.dog.name} on{" "}
            {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "EEEE d MMMM")} at{" "}
            {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "HH:mm")}.
          </p>
          <p>Total {formatPricePence(booking.service.pricePence)} · {formatDuration(booking.service.durationMinutes)}</p>
          {booking.meetingType === "virtual" ? <p>{site.virtualMeetingNote}</p> : <p>I’ll come to {booking.address}.</p>}
          {booking.status !== "confirmed" ? (
            <p className="text-sm">If this still says pending, wait a moment — payment confirmation can take a few seconds.</p>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-muted-foreground">Thanks. If you paid, you’ll get a confirmation shortly.</p>
      )}
      <Button asChild className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
