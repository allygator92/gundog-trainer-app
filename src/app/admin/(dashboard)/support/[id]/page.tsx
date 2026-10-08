import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportFeedbackForm } from "@/components/admin/support-feedback-form";
import { SupportStatusBadge, SupportStatusBar } from "@/components/admin/support-status-badge";
import { SupportStatusForm } from "@/components/admin/support-status-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSupportKind } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await prisma.supportRequest.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/support" className="hover:text-foreground hover:underline">
              Support
            </Link>
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{request.title}</h2>
          <p className="mt-1 text-muted-foreground">
            {formatSupportKind(request.kind)} · raised {request.createdAt.toLocaleString("en-GB")} by {request.submittedBy}
          </p>
        </div>
        <SupportStatusBadge status={request.status} />
      </div>

      <SupportStatusBar status={request.status} />

      {request.status === "needs_feedback" ? (
        <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h3 className="font-semibold">More detail needed</h3>
          <p className="text-sm text-muted-foreground">
            Add anything that would help, then send it from here - no need to email separately.
          </p>
          <SupportFeedbackForm requestId={request.id} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="whitespace-pre-wrap">{request.body}</p>
            {request.resolutionNotes ? (
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resolution</p>
                <p className="mt-1 whitespace-pre-wrap">{request.resolutionNotes}</p>
              </div>
            ) : null}
            {request.messages.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium">Updates</h3>
                <ul className="space-y-3">
                  {request.messages.map((message) => (
                    <li key={message.id} className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">
                        {message.authorEmail} · {message.createdAt.toLocaleString("en-GB")}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {request.status !== "needs_feedback" && request.status !== "resolved" ? (
              <SupportFeedbackForm requestId={request.id} />
            ) : null}
          </CardContent>
        </Card>

        <SupportStatusForm key={request.status} requestId={request.id} currentStatus={request.status} />
      </div>
    </div>
  );
}
