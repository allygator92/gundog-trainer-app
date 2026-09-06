import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { BrandMark } from "@/components/marketing/brand-lockup";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { adminHeaderLayout } from "@/lib/admin-header-layout";
import type { SiteTheme } from "@/lib/theme";
import { site } from "@content/site";

export function AdminHeader({ theme, email }: { theme: SiteTheme; email: string | null }) {
  return (
    <header className="admin-header" data-testid="admin-header">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className={adminHeaderLayout.bar}>
          <h1 className={adminHeaderLayout.brand} data-testid="admin-header-brand">
            <Link href="/" className="flex min-w-0 items-center gap-2" aria-label={`${site.name} home`}>
              <BrandMark size={36} className="site-logo-mark shrink-0" />
              <span className="site-logo hidden min-w-0 truncate font-display text-base font-semibold tracking-tight sm:inline sm:text-lg">
                {site.name}
              </span>
            </Link>
            <span className="admin-kicker shrink-0 text-xs font-medium uppercase tracking-widest text-primary">
              Admin
            </span>
          </h1>
          <div className={adminHeaderLayout.toggle} data-testid="admin-header-toggle">
            <ThemeToggle theme={theme} />
          </div>
          <div className={adminHeaderLayout.actions} data-testid="admin-header-actions">
            {email ? (
              <span className="admin-user-email hidden max-w-[12rem] truncate text-sm text-muted-foreground lg:inline">
                {email}
              </span>
            ) : null}
            <Button asChild variant="outline" size="sm" className="admin-header-btn">
              <Link href="/admin/support">Support</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="admin-header-btn">
              <Link href="/">View site</Link>
            </Button>
            <form action={signOut} className="contents">
              <Button type="submit" variant="ghost" size="sm" className="admin-header-btn">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <AdminNav />
      </div>
    </header>
  );
}
