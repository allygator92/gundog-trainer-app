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
    <div className={cn("mx-auto w-full max-w-6xl px-4 pt-12 pb-4 text-center sm:px-6 sm:pt-16", className)}>
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      ) : null}
      <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
