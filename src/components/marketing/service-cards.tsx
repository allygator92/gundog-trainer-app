import Link from "next/link";
import type { Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatPricePence, formatServiceType } from "@/lib/format";

export function ServiceCards({
  services,
  heading,
  intro,
  headingLevel = 2,
}: {
  services: Service[];
  heading: string;
  intro?: string;
  headingLevel?: 1 | 2;
}) {
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <HeadingTag className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {heading}
        </HeadingTag>
        {intro ? <p className="mt-3 text-muted-foreground">{intro}</p> : null}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id} className="flex flex-col">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                {formatServiceType(service.type)}
              </p>
              <CardTitle className="font-display text-2xl">{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold">{formatPricePence(service.pricePence)}</p>
                <p className="text-sm text-muted-foreground">{formatDuration(service.durationMinutes)}</p>
              </div>
              <Button asChild>
                <Link href="/book">Book</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
