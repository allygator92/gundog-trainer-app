import { SupportRequestForm } from "@/components/admin/support-request-form";
import { SupportStatusBadge } from "@/components/admin/support-status-badge";
import { formatSupportKind } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const requests = await prisma.supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Support</h2>
        <p className="mt-1 text-muted-foreground">
          Raise a bug, a change, or something you’d like added. You’ll get a confirmation here, and status updates stay
          in this section.
        </p>
      </div>

      <SupportRequestForm />

      <section className="space-y-3">
        <h3 className="font-semibold">Your requests</h3>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing raised yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/admin/support/${request.id}`} className="font-medium hover:underline">
                    {request.title}
                  </Link>
                  <p className="text-muted-foreground">
                    {formatSupportKind(request.kind)} · {request.createdAt.toLocaleString("en-GB")}
                  </p>
                </div>
                <SupportStatusBadge status={request.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
