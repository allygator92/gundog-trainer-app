import type { Metadata } from "next";
import { ServiceCards } from "@/components/marketing/service-cards";
import { sessionOffer } from "@/lib/format";
import { getActiveServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Virtual and in-person gundog training sessions. Prices are listed per lesson.",
};

export default async function PricingPage() {
  const { services } = await getActiveServices();
  const offer = sessionOffer(services);

  return (
    <ServiceCards
      services={services}
      heading="Pricing"
      headingLevel={1}
      intro={
        offer?.pricingIntro ??
        "A video hour covers whistle timing, handling, and homework. An in-person session is on the ground. Shot, water, and cover need the in-person session."
      }
    />
  );
}
