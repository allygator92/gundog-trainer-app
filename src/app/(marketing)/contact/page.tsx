import type { Metadata } from "next";
import { contactContent } from "@content/contact";
import { demo } from "@content/demo";
import { site } from "@content/site";
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
        <div className="px-0 sm:px-0">
          <ul className="space-y-3 text-sm">
            <li>
              <span className="block text-muted-foreground">Phone</span>
              <a href={site.phoneHref} className="font-medium hover:text-primary">
                {site.phone}
              </a>
            </li>
            <li>
              <span className="block text-muted-foreground">Email</span>
              <a href={`mailto:${site.email}`} className="font-medium hover:text-primary">
                {site.email}
              </a>
            </li>
            <li>
              <span className="block text-muted-foreground">Social</span>
              <div className="flex gap-4">
                {site.socials.map((social) => (
                  <a key={social.label} href={social.href} className="font-medium hover:text-primary">
                    {social.label}
                  </a>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-12 sm:pt-16">
        <ContactForm privacyNote={contactContent.privacyNote} />
      </div>
    </div>
  );
}
