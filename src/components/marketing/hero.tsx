import Image from "next/image";
import Link from "next/link";
import { homeContent } from "@content/home";
import { site } from "@content/site";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={site.images.hero}
          alt="A working Labrador standing in a field, ready to hunt"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="site-hero-overlay absolute inset-0" />
      </div>
      <div className="relative mx-auto flex min-h-[34rem] w-full max-w-6xl flex-col justify-center px-4 py-20 sm:min-h-[40rem] sm:px-6">
        <div className="site-hero-panel max-w-2xl">
          <p className="site-hero-kicker text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {homeContent.eyebrow}
          </p>
          <h1 className="site-hero-copy mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {homeContent.headline}
          </h1>
          <p className="site-hero-intro mt-5 max-w-xl text-lg text-muted-foreground">{homeContent.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="site-hero-primary site-book">
              <Link href={homeContent.primaryCta.href}>{homeContent.primaryCta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="site-hero-outline">
              <Link href={homeContent.secondaryCta.href}>{homeContent.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
