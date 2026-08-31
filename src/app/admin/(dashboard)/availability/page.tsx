import { AvailabilityManager } from "@/components/admin/availability-manager";
import { BOOKING_TIMEZONE, defaultWeeklyHours } from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  const [rules, blockedDates] = await Promise.all([
    prisma.availabilityRule.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }),
    prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Availability</h2>
        <p className="mt-1 text-muted-foreground">
          Set weekly hours and block days off. The booking page only offers open times.
        </p>
      </div>
      <AvailabilityManager
        initialDays={defaultWeeklyHours(rules)}
        blockedDates={blockedDates.map((row) => ({
          id: row.id,
          dateLabel: formatInTimeZone(row.date, BOOKING_TIMEZONE, "EEEE d MMMM yyyy"),
          reason: row.reason,
        }))}
      />
    </div>
  );
}
