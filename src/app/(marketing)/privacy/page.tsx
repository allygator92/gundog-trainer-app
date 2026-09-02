import type { Metadata } from "next";
import Link from "next/link";
import { privacyContent } from "@content/privacy";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: privacyContent.title,
  description: "How Gundog Trainer stores and uses your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader
        className="px-0 sm:px-0"
        title={privacyContent.title}
        description={`Last updated ${privacyContent.updated}.`}
      />
      <div className="space-y-8">
        {privacyContent.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
            <p className="mt-2 text-muted-foreground">{section.body}</p>
            {section.heading === "Cookies" ? (
              <p className="mt-2">
                <Link href="/cookies" className="underline underline-offset-2 hover:text-foreground">
                  Cookie details
                </Link>
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
