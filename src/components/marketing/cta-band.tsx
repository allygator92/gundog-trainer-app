import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBand({
  heading,
  body,
  href,
  label,
}: {
  heading: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10">
        <h2 className="font-display text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-3 max-w-xl text-primary-foreground/85">{body}</p>
        <Button asChild size="lg" variant="secondary" className="mt-6">
          <Link href={href}>{label}</Link>
        </Button>
      </div>
    </section>
  );
}
