import { cookies } from "next/headers";
import { CookieNotice } from "@/components/marketing/cookie-notice";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { THEME_COOKIE, parseSiteTheme } from "@/lib/theme";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const theme = parseSiteTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <div
      data-marketing-theme
      data-theme={theme}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader theme={theme} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CookieNotice />
    </div>
  );
}
