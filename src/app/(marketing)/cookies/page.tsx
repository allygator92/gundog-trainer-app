import type { Metadata } from "next";
import { cookiesContent } from "@content/privacy";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: cookiesContent.title,
  description: cookiesContent.intro,
};

export default function CookiesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader
        className="px-0 sm:px-0"
        title={cookiesContent.title}
        description={`Last updated ${cookiesContent.updated}. ${cookiesContent.intro}`}
      />
      <ul className="space-y-3">
        {cookiesContent.rows.map((row) => (
          <li key={row.name} className="rounded-xl border bg-card p-4">
            <p className="font-medium">{row.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{row.purpose}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Kept for {row.duration}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
