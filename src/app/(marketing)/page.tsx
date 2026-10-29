import { homeContent } from "@content/home";
import { site } from "@content/site";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqList } from "@/components/marketing/faq-list";
import { Hero } from "@/components/marketing/hero";
import { PhotoGallery } from "@/components/marketing/photo-gallery";
import { ServiceCards } from "@/components/marketing/service-cards";
import { SessionExpect } from "@/components/marketing/session-expect";
import { TestimonialStrip } from "@/components/marketing/testimonial-strip";
import { sessionOffer } from "@/lib/format";
import { getActiveServices, getPublishedTestimonials } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ services, sample }, testimonials] = await Promise.all([
    getActiveServices(),
    getPublishedTestimonials(),
  ]);
  const offer = sessionOffer(services);

  return (
    <>
      <Hero
        intro={homeContent.intro}
        primaryCta={sample ? homeContent.sampleCta : homeContent.primaryCta}
      />
      <ServiceCards
        id="pricing"
        services={services}
        heading={homeContent.servicesHeading}
        intro={offer?.servicesIntro ?? homeContent.servicesIntro}
      />
      <PhotoGallery
        photos={site.images.gallery.filter((photo) =>
          [
            "photo-1642017273035-f6d949467443",
            "photo-1514134952839-71312e5b823f",
            "1490908",
          ].some((id) => photo.src.includes(id)),
        )}
        heading={site.galleryHeading}
      />
      <TestimonialStrip testimonials={testimonials} heading={homeContent.testimonialsHeading} />
      <SessionExpect />
      <FaqList />
      <CtaBand
        heading={sample ? homeContent.sampleBand.heading : homeContent.ctaBand.heading}
        body={sample && offer ? offer.sampleBand : homeContent.ctaBand.body}
        href={sample ? homeContent.sampleBand.href : homeContent.ctaBand.href}
        label={sample ? homeContent.sampleBand.label : homeContent.ctaBand.label}
      />
    </>
  );
}
