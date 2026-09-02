import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      _count: { select: { dogs: true, bookings: true, documents: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
        <p className="mt-1 text-muted-foreground">People who have submitted an intake or booked a session.</p>
      </div>
      {clients.length === 0 ? (
        <p className="text-sm text-muted-foreground">No clients yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Dogs</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3 font-medium">Files</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${client.id}`} className="font-medium hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                  <td className="px-4 py-3">{client._count.dogs}</td>
                  <td className="px-4 py-3">{client._count.bookings}</td>
                  <td className="px-4 py-3">{client._count.documents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
