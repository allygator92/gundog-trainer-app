"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackClientEvent } from "@/lib/analytics-client";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }
    trackClientEvent("page_view", { path: pathname });
  }, [pathname]);

  return null;
}
