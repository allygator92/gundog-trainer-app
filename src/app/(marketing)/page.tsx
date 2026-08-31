import { homeContent } from "@content/home";
import { CtaBand } from "@/components/marketing/cta-band";
import { Hero } from "@/components/marketing/hero";
import { ServiceCards } from "@/components/marketing/service-cards";
import { TestimonialStrip } from "@/components/marketing/testimonial-strip";
import { getActiveServices, getPublishedTestimonials } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, testimonials] = await Promise.all([
    getActiveServices(),
    getPublishedTestimonials(),
  ]);

  return (
    <>
      <Hero />
      <ServiceCards
        services={services}
        heading={homeContent.servicesHeading}
        intro={homeContent.servicesIntro}
      />
      <TestimonialStrip testimonials={testimonials} heading={homeContent.testimonialsHeading} />
      <CtaBand
        heading={homeContent.ctaBand.heading}
        body={homeContent.ctaBand.body}
        href={homeContent.ctaBand.href}
        label={homeContent.ctaBand.label}
      />
    </>
  );
}
