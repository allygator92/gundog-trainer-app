import Link from "next/link";
import { navigation, site } from "@content/site";
import { BrandLockup } from "@/components/marketing/brand-lockup";

export function SiteFooter() {
  return (
    <footer className="site-footer relative z-10">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <BrandLockup compact className="site-footer-brand" />
          <p className="site-footer-muted mt-2 max-w-xs text-sm text-muted-foreground">{site.tagline}</p>
        </div>
        <div>
          <p className="site-footer-heading text-sm font-medium">Explore</p>
          <ul className="mt-3 space-y-1 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-footer-link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="site-footer-link">
                Book
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="site-footer-link">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="site-footer-link">
                Cookies
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="site-footer-heading text-sm font-medium">Contact</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link href="/contact" className="site-footer-link">
                Send a message
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="site-footer-muted border-t border-border/60 py-4 text-center text-xs">
        {site.name}
      </p>
    </footer>
  );
}
