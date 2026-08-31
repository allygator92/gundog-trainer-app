import type { Testimonial } from "@prisma/client";

export function TestimonialStrip({
  testimonials,
  heading,
}: {
  testimonials: Testimonial[];
  heading: string;
}) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight">{heading}</h2>
        <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.id}
              className="min-w-[80%] snap-start rounded-xl border bg-card p-6 shadow-sm md:min-w-0"
            >
              <p className="text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-medium text-primary">{testimonial.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
