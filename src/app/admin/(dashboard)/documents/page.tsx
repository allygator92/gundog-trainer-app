import Link from "next/link";
import { DocumentUploadForm } from "@/components/admin/document-upload-form";
import { formatDocumentType } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const [documents, clients] = await Promise.all([
    prisma.document.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
        <p className="mt-1 text-muted-foreground">
          Intake PDFs and extra records. Downloads use a private link that expires after 10 minutes.
        </p>
      </div>

      <section className="max-w-md space-y-3">
        <h3 className="font-semibold">Upload a record</h3>
        <DocumentUploadForm clients={clients} />
      </section>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files stored yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Download</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {document.createdAt.toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${document.clientId}`} className="hover:underline">
                      {document.client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{document.filename}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDocumentType(document.type)}</td>
                  <td className="px-4 py-3">
                    <Link className="text-primary hover:underline" href={`/admin/documents/${document.id}/file`}>
                      Open
                    </Link>
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
