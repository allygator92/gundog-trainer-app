import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { percent, summariseAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const since = subDays(new Date(), 30);

  const [events, bookings] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { name: true, path: true, sessionId: true, label: true, createdAt: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { status: true },
    }),
  ]);

  const stats = summariseAnalytics(events, bookings);
  const peakViews = Math.max(1, ...stats.funnel.map((step) => step.count), ...stats.topPages.map((page) => page.views));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="mt-1 text-muted-foreground">
          Last 30 days. Page views and booking steps are anonymous — no names, emails, or IP addresses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Unique visitors</CardDescription>
            <CardTitle className="text-3xl">{stats.uniqueVisitors}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Page views</CardDescription>
            <CardTitle className="text-3xl">{stats.pageViews}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Paid bookings</CardDescription>
            <CardTitle className="text-3xl">{stats.payments.confirmed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Abandoned at payment</CardDescription>
            <CardTitle className="text-3xl">{percent(stats.payments.abandonedRate)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">Booking drop-off</h3>
        <p className="text-sm text-muted-foreground">
          Same-tab journeys from the book page. Payment outcomes come from Stripe bookings created in this window.
        </p>
        <ol className="space-y-3 rounded-xl border bg-card p-4">
          {stats.funnel.map((step) => (
            <li key={step.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{step.label}</span>
                <span className="text-muted-foreground">
                  {step.count}
                  {step.name === "booking_viewed" ? "" : ` · ${percent(step.conversion)} continued`}
                  {step.dropOff > 0 ? ` · ${percent(step.dropOff)} dropped off` : ""}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(4, (step.count / peakViews) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          Of {stats.payments.startedCheckout} checkouts started, {stats.payments.confirmed} paid
          {stats.payments.pending ? `, ${stats.payments.pending} still pending` : ""}
          {stats.payments.cancelled ? `, ${stats.payments.cancelled} cancelled` : ""}. Paid conversion{" "}
          {percent(stats.payments.paidRate)}.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Top pages</h3>
        {stats.topPages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No traffic recorded yet. Browse the public site to start filling this in.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {stats.topPages.map((page) => (
              <li key={page.path} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium">{page.path}</span>
                <span className="text-muted-foreground">
                  {page.views} views · {page.sessions} visitors
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
