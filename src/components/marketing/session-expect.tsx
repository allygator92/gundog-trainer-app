import { sessionExpectContent } from "@content/faq";

export function SessionExpect({ compact = false }: { compact?: boolean }) {
  return (
    <section id={sessionExpectContent.id} className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {sessionExpectContent.heading}
      </h2>
      <p className="mt-3 text-muted-foreground">{sessionExpectContent.intro}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sessionExpectContent.blocks.map((block) => (
          <article key={block.title} className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">{block.title}</h3>
            {compact ? (
              <p className="mt-2 line-clamp-6 text-sm text-muted-foreground">{block.body}</p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{block.body}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
