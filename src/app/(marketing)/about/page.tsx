import type { Metadata } from "next";
import Image from "next/image";
import { aboutContent } from "@content/about";
import { demo } from "@content/demo";
import { site } from "@content/site";
import { DemoCallout } from "@/components/demo/demo-callout";
import { PageHeader } from "@/components/marketing/page-header";
import { TestimonialStrip } from "@/components/marketing/testimonial-strip";
import { getPublishedTestimonials } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: aboutContent.intro,
};

export default async function AboutPage() {
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      <PageHeader title={aboutContent.headline} description={aboutContent.intro} />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <DemoCallout title={demo.about.title}>
          <p>{demo.about.body}</p>
        </DemoCallout>
      </div>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={site.images.about}
            alt={`${site.trainerName}, ${site.trainerRole}`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div className="space-y-4 text-muted-foreground">
          {aboutContent.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="text-xs">{aboutContent.photoCaption}</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          {aboutContent.credentialsHeading}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {aboutContent.credentials.map((item) => (
            <div key={item.title} className="rounded-xl border bg-card p-6">
              <h3 className="font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
      <TestimonialStrip testimonials={testimonials} heading="Kind words" />
    </>
  );
}
