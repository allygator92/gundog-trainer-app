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
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.id}
              className="w-full max-w-md rounded-xl border bg-card p-6 text-left shadow-sm"
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
