import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminIntakesPage() {
  const [dogs, documents] = await Promise.all([
    prisma.dog.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.document.findMany({
      where: { type: "intake_pdf" },
      select: { id: true, storagePath: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Intakes</h2>
        <p className="mt-1 text-muted-foreground">
          Submitted dog intake forms. Open Intakes after you sign in — the login page itself does not list them.
          PDF links expire after 10 minutes.
        </p>
      </div>
      {dogs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No intakes yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Dog</th>
                <th className="px-4 py-3 font-medium">PDF</th>
              </tr>
            </thead>
            <tbody>
              {dogs.map((dog) => {
                const document = documents.find((item) => item.storagePath.includes(dog.id));
                return (
                  <tr key={dog.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {dog.createdAt.toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <div>{dog.client.name}</div>
                      <div className="text-muted-foreground">{dog.client.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{dog.name}</div>
                      <div className="text-muted-foreground">{dog.breed}</div>
                    </td>
                    <td className="px-4 py-3">
                      {document ? (
                        <Link className="text-primary hover:underline" href={`/admin/intakes/${document.id}/pdf`}>
                          Download PDF
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">PDF not ready</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
