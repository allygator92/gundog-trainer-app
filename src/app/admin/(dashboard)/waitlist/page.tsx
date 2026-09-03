import { formatInTimeZone } from "date-fns-tz";
import { BOOKING_TIMEZONE } from "@/lib/availability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const entries = await prisma.waitlistEntry.findMany({
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    include: { service: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Waitlist</h2>
        <p className="mt-1 text-muted-foreground">
          People waiting for a day that was full. They are emailed if a session on that date is cancelled.
        </p>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No waitlist requests yet.</p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {entries.map((entry) => (
            <li key={entry.id} className="px-4 py-3 text-sm">
              <p className="font-medium">
                {formatInTimeZone(entry.date, BOOKING_TIMEZONE, "EEEE d MMMM yyyy")} · {entry.name}
              </p>
              <p className="text-muted-foreground">
                {entry.email}
                {entry.service ? ` · ${entry.service.name}` : ""}
                {entry.notifiedAt ? " · notified" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
