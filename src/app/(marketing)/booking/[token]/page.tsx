import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManageBookingPanel } from "@/components/booking/manage-booking-panel";
import { PageHeader } from "@/components/marketing/page-header";
import { getCalendarAvailability } from "@/lib/availability";
import { formatBookingWhen } from "@/lib/booking-email";
import { canReschedule } from "@/lib/booking-manage";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Manage booking",
  robots: { index: false, follow: false },
};

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: { dog: true, service: true },
  });

  if (!booking) {
    notFound();
  }

  if (booking.status === "cancelled") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <PageHeader className="px-0" title="This booking is cancelled" description="You can book a new time any time." />
      </div>
    );
  }

  if (booking.status !== "confirmed") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <PageHeader
          className="px-0"
          title="This booking is not ready yet"
          description="Once payment is confirmed you’ll be able to change it from the email we send."
        />
      </div>
    );
  }

  const calendar = await getCalendarAvailability(booking.serviceId, booking.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
      <PageHeader
        className="px-0"
        title={`Manage ${booking.dog.name}’s session`}
        description={`${booking.service.name} · ${formatBookingWhen(booking.startsAt)}`}
      />
      <ManageBookingPanel
        token={token}
        whenLabel={formatBookingWhen(booking.startsAt)}
        canMove={canReschedule(booking.startsAt)}
        startsAtIso={booking.startsAt.toISOString()}
        slots={calendar.slots}
        fullDateKeys={calendar.fullDateKeys}
      />
    </div>
  );
}
