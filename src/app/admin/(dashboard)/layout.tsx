import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminDemoNotes } from "@/components/demo/admin-demo-notes";
import { DemoGuide } from "@/components/demo/demo-guide";
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
      <AdminHeader theme={theme} email={user.email ?? null} />
      <div id="admin-main" className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <AdminDemoNotes />
        {children}
      </div>
      <DemoGuide />
    </div>
  );
}
