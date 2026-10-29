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
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader className="px-0 sm:px-0" title={contactContent.headline} description={contactContent.intro} />
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
        <DemoCallout title={demo.contact.title}>
          <p>{demo.contact.body}</p>
        </DemoCallout>
        <ContactForm privacyNote={contactContent.privacyNote} />
      </div>
    </div>
  );
}
