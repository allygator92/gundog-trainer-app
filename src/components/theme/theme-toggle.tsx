"use client";

import { useState } from "react";
import { siteThemes, themeCookie, type SiteTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ theme }: { theme: SiteTheme }) {
  const [current, setCurrent] = useState(theme);

  function select(next: SiteTheme) {
    setCurrent(next);
    document.cookie = themeCookie(next);
    document.querySelector("[data-marketing-theme]")?.setAttribute("data-theme", next);
  }

  return (
    <div className="theme-toggle inline-flex rounded-full border border-border p-0.5" role="group" aria-label="Website look">
      {siteThemes.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={current === item.id}
          aria-label={`${item.label} look. ${item.description}`}
          title={item.description}
          onClick={() => select(item.id)}
          className={cn(
            "min-h-8 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
            current === item.id ? "theme-toggle-active" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
