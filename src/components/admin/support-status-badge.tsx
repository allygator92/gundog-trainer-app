import { cn } from "@/lib/utils";
import { formatSupportStatus } from "@/lib/format";
import { SUPPORT_STATUS_STEPS, type SupportStatus } from "@/lib/support";

const styles: Record<SupportStatus, string> = {
  submitted: "bg-sky-100 text-sky-950",
  investigating: "bg-amber-100 text-amber-950",
  needs_feedback: "bg-orange-100 text-orange-950",
  resolved: "bg-emerald-100 text-emerald-950",
};

export function SupportStatusBadge({ status }: { status: SupportStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      {formatSupportStatus(status)}
    </span>
  );
}

export function SupportStatusBar({ status }: { status: SupportStatus }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4" aria-label="Request status">
      {SUPPORT_STATUS_STEPS.map((step, index) => {
        const currentIndex = SUPPORT_STATUS_STEPS.findIndex((item) => item.id === status);
        const complete = index < currentIndex || status === "resolved";
        const current = step.id === status;
        return (
          <li
            key={step.id}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              current ? "border-primary bg-primary/5 font-medium" : "border-border",
              complete && !current ? "text-muted-foreground" : "",
            )}
          >
            <span className="block text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              {complete || current ? (current ? "Current" : "Done") : "Later"}
            </span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
