import type { Metadata } from "next";
import { ServiceCards } from "@/components/marketing/service-cards";
import { getActiveServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Virtual and in-person gundog training sessions. Prices are listed per lesson.",
};

export default async function PricingPage() {
  const services = await getActiveServices();

  return (
    <ServiceCards
      services={services}
      heading="Pricing"
      headingLevel={1}
      intro="Session prices come from the services list, so they stay in one place if they change. Travel for in-person work can be agreed when you book."
    />
  );
}
