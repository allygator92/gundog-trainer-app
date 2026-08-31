import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const adminSections = [
  {
    title: "Bookings",
    description: "View and manage upcoming sessions.",
    href: "/admin/bookings",
  },
  {
    title: "Availability",
    description: "Set weekly hours and block-out dates.",
    href: "/admin/availability",
  },
  {
    title: "Documents",
    description: "Access client intake PDFs and records.",
    href: "/admin/documents",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Overview</h2>
        <p className="mt-1 text-muted-foreground">
          Welcome to the admin shell. Booking management and availability tools arrive in Phase 5.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => (
          <Link key={section.href} href={section.href} className="block transition-opacity hover:opacity-90">
            <Card>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary">Coming in Phase 5</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
