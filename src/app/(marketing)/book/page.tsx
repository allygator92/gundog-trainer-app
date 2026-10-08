import type { Metadata } from "next";
import { bookContent } from "@content/book";
import { BookingFlow, type BookableService } from "@/components/booking/booking-flow";
import { PageHeader } from "@/components/marketing/page-header";
import { formatDuration, formatPricePence, formatServiceType } from "@/lib/format";
import { getActiveServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: bookContent.title,
  description: bookContent.intro,
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const [{ services, sample }, params] = await Promise.all([getActiveServices(), searchParams]);

  const bookableServices: BookableService[] = services.map((service) => ({
    id: service.id,
    name: service.name,
    type: service.type,
    durationMinutes: service.durationMinutes,
    pricePence: service.pricePence,
    description: service.description,
  }));

  if (sample) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
        <PageHeader className="px-0 sm:px-0" title={bookContent.headline} description={bookContent.intro} />
        <p className="mb-8 text-sm text-muted-foreground">
          These are the sample session prices. The diary database is not connected, so a time cannot be booked from this
          copy yet.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {bookableServices.map((service) => (
            <article key={service.id} className="rounded-xl border bg-card p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                {formatServiceType(service.type)}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">{service.name}</h2>
              {service.description ? <p className="mt-2 text-sm text-muted-foreground">{service.description}</p> : null}
              <p className="mt-4 text-xl font-semibold">{formatPricePence(service.pricePence)}</p>
              <p className="text-sm text-muted-foreground">{formatDuration(service.durationMinutes)}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
      <PageHeader className="px-0 sm:px-0" title={bookContent.headline} description={bookContent.intro} />
      <p className="mb-8 text-sm text-muted-foreground">
        Bring a slip lead if you have one.{" "}
        <a href="/training#sessions" className="underline underline-offset-2">
          What to expect, what to bring, and whether two dogs can share a session
        </a>
        .
      </p>
      <BookingFlow services={bookableServices} cancelled={params.cancelled === "1"} />
    </div>
  );
}
