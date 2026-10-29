import Link from "next/link";
import { archiveEnquiryAction, restoreEnquiryAction } from "@/app/admin/(dashboard)/enquiries/actions";
import { ArchiveEnquiriesButton } from "@/components/admin/archive-enquiries-button";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const archived = view === "archived";
  const [enquiries, openCount, archivedCount] = await Promise.all([
    prisma.contactSubmission.findMany({
      where: { archivedAt: archived ? { not: null } : null },
      orderBy: archived ? { archivedAt: "desc" } : { createdAt: "desc" },
      take: 50,
    }),
    prisma.contactSubmission.count({ where: { archivedAt: null } }),
    prisma.contactSubmission.count({ where: { archivedAt: { not: null } } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enquiries</h2>
          <p className="mt-1 text-muted-foreground">
            Messages from the contact form. Archive one when you have dealt with it. Archived messages stay available.
          </p>
        </div>
        {!archived && openCount > 0 ? <ArchiveEnquiriesButton /> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/enquiries"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            archived ? "text-muted-foreground hover:bg-muted" : "bg-muted font-medium",
          )}
        >
          Open ({openCount})
        </Link>
        <Link
          href="/admin/enquiries?view=archived"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            archived ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted",
          )}
        >
          Archived ({archivedCount})
        </Link>
      </div>

      {enquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {archived ? "No archived enquiries." : "No open enquiries."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">{archived ? "Restore" : "Archive"}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {enquiry.createdAt.toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3">{enquiry.name}</td>
                  <td className="px-4 py-3">
                    <a className="text-primary hover:underline" href={`mailto:${enquiry.email}`}>
                      {enquiry.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{enquiry.phone ?? "-"}</td>
                  <td className="max-w-md px-4 py-3 text-muted-foreground">{enquiry.message}</td>
                  <td className="px-4 py-3">
                    <form action={archived ? restoreEnquiryAction : archiveEnquiryAction}>
                      <input type="hidden" name="id" value={enquiry.id} />
                      <Button type="submit" variant="outline" size="sm">
                        {archived ? "Restore" : "Archive"}
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
