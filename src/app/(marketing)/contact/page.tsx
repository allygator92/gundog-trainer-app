import type { Metadata } from "next";
import { contactContent } from "@content/contact";
import { demo } from "@content/demo";
import { DemoCallout } from "@/components/demo/demo-callout";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHeader } from "@/components/marketing/page-header";

export const metadata: Metadata = {
  title: "Contact",
  description: contactContent.intro,
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <PageHeader
          className="mx-0 max-w-none px-0 pt-12 sm:px-0 sm:pt-16"
          title={contactContent.headline}
          description={contactContent.intro}
        />
        <DemoCallout title={demo.contact.title} className="mt-6">
          <p>{demo.contact.body}</p>
        </DemoCallout>
      </div>
      <div className="pt-12 sm:pt-16">
        <ContactForm privacyNote={contactContent.privacyNote} />
      </div>
    </div>
  );
}
