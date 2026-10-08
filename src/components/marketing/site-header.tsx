"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navigation, site } from "@content/site";
import { BrandLockup } from "@/components/marketing/brand-lockup";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import type { SiteTheme } from "@/lib/theme";

export function SiteHeader({ theme }: { theme: SiteTheme }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header sticky top-0 z-50" data-testid="site-header">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center pr-2" aria-label={`${site.name} home`}>
          <BrandLockup priority />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3" data-testid="site-header-controls">
          <nav className="hidden items-center gap-3 text-sm lg:flex xl:gap-5" aria-label="Primary">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="site-nav-link"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild size="sm" className="site-book">
              <Link href="/book" aria-current={pathname.startsWith("/book") ? "page" : undefined}>
                Book
              </Link>
            </Button>
          </nav>
          <ThemeToggle theme={theme} />

          <button
            type="button"
            className="site-menu-button inline-flex h-11 w-11 items-center justify-center rounded-md border border-input lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-haspopup="true"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="site-mobile-nav space-y-1 border-t border-border px-4 py-4 lg:hidden"
          aria-label="Mobile"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-mobile-link block rounded-md px-3 py-2.5 text-sm font-medium"
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild className="site-book mt-2 w-full">
            <Link href="/book" onClick={() => setOpen(false)}>
              Book a session
            </Link>
          </Button>
        </nav>
      ) : null}
    </header>
  );
}
