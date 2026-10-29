import type { Metadata } from "next";
import { intakeContent } from "@content/intake";
import { IntakeWizard } from "@/components/forms/intake-wizard";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: intakeContent.title,
  description: intakeContent.intro,
};

export default function IntakePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader className="px-0 sm:px-0" title={intakeContent.headline} description={intakeContent.intro} />
      <div className="relative mx-auto max-w-2xl rounded-xl border bg-card p-6 text-left shadow-sm">
        <IntakeWizard />
      </div>
    </div>
  );
}
