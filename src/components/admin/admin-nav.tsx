"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/intakes", label: "Intakes" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/waitlist", label: "Waitlist" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "admin-nav-link hover:text-foreground",
              active ? "is-active font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
