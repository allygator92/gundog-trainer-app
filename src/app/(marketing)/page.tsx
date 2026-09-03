import { homeContent } from "@content/home";
import { site } from "@content/site";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqList } from "@/components/marketing/faq-list";
import { Hero } from "@/components/marketing/hero";
import { PhotoGallery } from "@/components/marketing/photo-gallery";
import { ServiceCards } from "@/components/marketing/service-cards";
import { SessionExpect } from "@/components/marketing/session-expect";
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
      <PhotoGallery
        photos={site.images.gallery}
        heading="Working dogs, field and town"
        intro="Retrieving, hunting cover, water work, and the same breeds keeping their heads in built-up streets."
      />
      <TestimonialStrip testimonials={testimonials} heading={homeContent.testimonialsHeading} />
      <SessionExpect />
      <FaqList />
      <CtaBand
        heading={homeContent.ctaBand.heading}
        body={homeContent.ctaBand.body}
        href={homeContent.ctaBand.href}
        label={homeContent.ctaBand.label}
      />
    </>
  );
}
