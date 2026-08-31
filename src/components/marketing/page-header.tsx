import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl px-4 pt-12 pb-4 sm:px-6 sm:pt-16", className)}>
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
