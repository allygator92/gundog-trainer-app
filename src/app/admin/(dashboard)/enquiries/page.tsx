import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Enquiries</h2>
        <p className="mt-1 text-muted-foreground">Recent contact form messages.</p>
      </div>
      {enquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Message</th>
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
                  <td className="max-w-md px-4 py-3 text-muted-foreground">{enquiry.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
