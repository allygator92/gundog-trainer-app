import { cookies } from "next/headers";
import Link from "next/link";
import { signInWithPassword } from "@/app/admin/actions";
import { DemoCallout } from "@/components/demo/demo-callout";
import { BrandLockup } from "@/components/marketing/brand-lockup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demo } from "@content/demo";
import { site } from "@content/site";
import { THEME_COOKIE, parseSiteTheme } from "@/lib/theme";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const theme = parseSiteTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <div data-theme={theme} className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <Link href="/" className="inline-flex" aria-label={`${site.name} home`}>
          <BrandLockup />
        </Link>
        <DemoCallout title={demo.login.title}>
          <p>{demo.login.body}</p>
        </DemoCallout>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Admin sign in</CardTitle>
            <CardDescription>
              Sign in with your Supabase admin account. Create the user in the Supabase dashboard
              under Authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signInWithPassword} className="space-y-4">
              <input type="hidden" name="redirect" value={params.redirect ?? "/admin"} />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              {params.error ? (
                <p className="text-sm text-destructive" role="alert">
                  {params.error}
                </p>
              ) : null}
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
