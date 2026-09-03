import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { DemoCallout } from "@/components/demo/demo-callout";
import { DemoGuide } from "@/components/demo/demo-guide";
import { BrandLockup } from "@/components/marketing/brand-lockup";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { demo } from "@content/demo";
import { site } from "@content/site";
import { createClient } from "@/lib/supabase/server";
import { THEME_COOKIE, parseSiteTheme } from "@/lib/theme";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const theme = parseSiteTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <div data-theme={theme} className="min-h-screen bg-muted/30 text-foreground">
      <a href="#admin-main" className="skip-link">
        Skip to dashboard content
      </a>
      <header className="admin-header">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="flex min-w-0 items-center gap-3">
              <Link href="/" className="min-w-0 shrink-0" aria-label={`${site.name} home`}>
                <BrandLockup compact />
              </Link>
              <span className="admin-kicker text-xs font-medium uppercase tracking-widest text-primary">Admin</span>
            </h1>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <ThemeToggle theme={theme} />
              <span className="admin-user-email hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button asChild variant="outline" size="sm" className="admin-header-btn">
                <Link href="/">View site</Link>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm" className="admin-header-btn">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <div id="admin-main" className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <DemoCallout title={demo.admin.title}>
          <p>{demo.admin.body}</p>
        </DemoCallout>
        {children}
      </div>
      <DemoGuide />
    </div>
  );
}
