import { faqContent } from "@content/faq";

export function FaqList({ heading = faqContent.heading }: { heading?: string }) {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>
      <div className="mt-8 divide-y rounded-2xl border bg-card">
        {faqContent.items.map((item) => (
          <details key={item.question} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.question}
                <span className="mt-0.5 text-muted-foreground group-open:hidden" aria-hidden="true">
                  +
                </span>
                <span className="mt-0.5 hidden text-muted-foreground group-open:inline" aria-hidden="true">
                  −
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
