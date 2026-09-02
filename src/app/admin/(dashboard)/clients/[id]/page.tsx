import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { DeleteClientForm } from "@/components/admin/delete-client-form";
import { DocumentUploadForm } from "@/components/admin/document-upload-form";
import { BOOKING_TIMEZONE } from "@/lib/availability";
import { formatDocumentType, formatServiceType } from "@/lib/format";
import { intakeRows } from "@/lib/intake-display";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      dogs: { orderBy: { createdAt: "desc" } },
      bookings: {
        include: { dog: true, service: true },
        orderBy: { startsAt: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/clients" className="hover:text-foreground hover:underline">
            Clients
          </Link>
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{client.name}</h2>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>
            <a className="text-primary hover:underline" href={`mailto:${client.email}`}>
              {client.email}
            </a>
          </p>
          {client.phone ? <p>{client.phone}</p> : null}
          {client.address ? <p>{client.address}</p> : null}
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">Dogs</h3>
        {client.dogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dogs on file.</p>
        ) : (
          <div className="space-y-4">
            {client.dogs.map((dog) => {
              const answers = intakeRows(dog.intakeData);
              return (
                <article key={dog.id} className="rounded-xl border bg-card p-4">
                  <h4 className="font-medium">
                    {dog.name}
                    {dog.breed ? ` · ${dog.breed}` : ""}
                    {dog.age ? ` · ${dog.age} yrs` : ""}
                  </h4>
                  {answers.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No intake snapshot.</p>
                  ) : (
                    <dl className="mt-3 divide-y text-sm">
                      {answers.slice(0, 8).map((row) => (
                        <div key={row.label} className="grid gap-1 py-2 sm:grid-cols-3">
                          <dt className="text-muted-foreground">{row.label}</dt>
                          <dd className="sm:col-span-2">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Bookings</h3>
        {client.bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {client.bookings.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <Link href={`/admin/bookings/${booking.id}`} className="font-medium hover:underline">
                    {formatInTimeZone(booking.startsAt, BOOKING_TIMEZONE, "EEE d MMM yyyy, HH:mm")}
                  </Link>
                  <p className="text-muted-foreground">
                    {booking.dog.name} · {formatServiceType(booking.meetingType)}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Documents</h3>
        {client.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {client.documents.map((document) => (
              <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p>{document.filename}</p>
                  <p className="text-muted-foreground">{formatDocumentType(document.type)}</p>
                </div>
                <Link className="text-primary hover:underline" href={`/admin/documents/${document.id}/file`}>
                  Download
                </Link>
              </li>
            ))}
          </ul>
        )}
        <DocumentUploadForm clients={[{ id: client.id, name: client.name }]} defaultClientId={client.id} />
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Delete this client</h3>
        <DeleteClientForm clientId={client.id} clientName={client.name} error={query.error} />
      </section>
    </div>
  );
}
