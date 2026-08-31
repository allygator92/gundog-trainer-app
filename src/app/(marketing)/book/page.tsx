import type { Metadata } from "next";
import { bookContent } from "@content/book";
import { BookingFlow, type BookableService } from "@/components/booking/booking-flow";
import { PageHeader } from "@/components/marketing/page-header";
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
  const [services, params] = await Promise.all([getActiveServices(), searchParams]);

  const bookableServices: BookableService[] = services.map((service) => ({
    id: service.id,
    name: service.name,
    type: service.type,
    durationMinutes: service.durationMinutes,
    pricePence: service.pricePence,
    description: service.description,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader className="px-0 sm:px-0" title={bookContent.headline} description={bookContent.intro} />
      <BookingFlow services={bookableServices} cancelled={params.cancelled === "1"} />
    </div>
  );
}
