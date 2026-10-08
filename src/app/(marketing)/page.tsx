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
  const [{ services }, testimonials] = await Promise.all([
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
        heading="In the field"
        intro="A Labrador in grass, a dog holding a duck, a pointer with a bird, a shake-off, a Gun on a hill, and a springer in cover."
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
