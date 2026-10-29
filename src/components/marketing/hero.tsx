import Image from "next/image";
import Link from "next/link";
import { homeContent } from "@content/home";
import { site } from "@content/site";
import { Button } from "@/components/ui/button";

export function Hero({
  intro = homeContent.intro,
  primaryCta = homeContent.primaryCta,
}: {
  intro?: string;
  primaryCta?: { href: string; label: string };
}) {
  return (
    <section className="site-hero relative overflow-hidden">
      <div className="site-hero-copyband relative">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={site.images.hero}
            alt=""
            fill
            priority
            loading="eager"
            className="site-hero-sky object-cover"
            style={{ objectPosition: "center top" }}
            sizes="100vw"
          />
          <div className="site-hero-scrim absolute inset-0" />
        </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-10 pt-14 text-center sm:px-6 sm:pb-12 sm:pt-20">
          <div className="site-hero-panel mx-auto max-w-2xl">
            <p className="site-hero-kicker text-sm font-medium uppercase tracking-[0.2em] text-primary">
              {homeContent.eyebrow}
            </p>
            <h1 className="site-hero-copy mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {homeContent.headline}
            </h1>
            <p className="site-hero-intro mx-auto mt-5 max-w-xl text-lg">{intro}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="site-hero-primary site-book">
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="site-hero-outline">
                <Link href={homeContent.secondaryCta.href}>{homeContent.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="site-hero-stage relative h-72 sm:h-96 lg:h-[34rem]">
        <Image
          src={site.images.hero}
          alt="Three black Labradors sitting in a stubble field"
          fill
          priority
          loading="eager"
          className="object-cover"
          style={{ objectPosition: "center 68%" }}
          sizes="100vw"
        />
        <div className="site-hero-stage-fade pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-24" />
      </div>
    </section>
  );
}
