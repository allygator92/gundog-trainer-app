import type { Metadata } from "next";
import { trainingContent } from "@content/training";
import { site } from "@content/site";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqList } from "@/components/marketing/faq-list";
import { PageHeader } from "@/components/marketing/page-header";
import { PhotoGallery } from "@/components/marketing/photo-gallery";
import { SessionExpect } from "@/components/marketing/session-expect";

export const metadata: Metadata = {
  title: trainingContent.title,
  description: trainingContent.intro,
};

export default function TrainingPage() {
  return (
    <>
      <PageHeader title={trainingContent.headline} description={trainingContent.intro} />
      <div className="mx-auto w-full max-w-3xl space-y-12 px-4 pb-8 sm:px-6">
        {trainingContent.sections.map((section) => (
          <section key={section.id} id={section.id} className="space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {section.heading}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
      <SessionExpect />
      <FaqList />
      <PhotoGallery
        photos={site.images.gallery}
        heading={trainingContent.galleryHeading}
        intro={trainingContent.galleryIntro}
      />
      <CtaBand
        heading={trainingContent.cta.heading}
        body={trainingContent.cta.body}
        href={trainingContent.cta.href}
        label={trainingContent.cta.label}
      />
    </>
  );
}
