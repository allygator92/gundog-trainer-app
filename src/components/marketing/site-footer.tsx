import Link from "next/link";
import { navigation, site } from "@content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold text-primary">{site.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{site.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="text-muted-foreground hover:text-foreground">
                Book
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={site.phoneHref} className="hover:text-foreground">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-foreground">
                {site.email}
              </a>
            </li>
            {site.socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} className="hover:text-foreground">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        {site.name} · {site.location}
      </p>
    </footer>
  );
}
