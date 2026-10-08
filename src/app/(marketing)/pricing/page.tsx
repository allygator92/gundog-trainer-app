import type { Metadata } from "next";
import { ServiceCards } from "@/components/marketing/service-cards";
import { getActiveServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Virtual and in-person gundog training sessions. Prices are listed per lesson.",
};

export default async function PricingPage() {
  const { services } = await getActiveServices();

  return (
    <ServiceCards
      services={services}
      heading="Pricing"
      headingLevel={1}
      intro="A video hour is £65: whistle timing, handling, and homework. Ninety minutes in person is £95: steadiness, dummies, a spaniel’s pattern, or a retriever at the peg. Shot, water, and cover need the in-person session."
    />
  );
}
