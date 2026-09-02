import { cn } from "@/lib/utils";
import { formatBookingStatus } from "@/lib/format";

const styles = {
  pending_payment: "bg-amber-100 text-amber-950",
  confirmed: "bg-emerald-100 text-emerald-950",
  cancelled: "bg-muted text-muted-foreground",
} as const;

export function BookingStatusBadge({
  status,
}: {
  status: keyof typeof styles;
}) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      {formatBookingStatus(status)}
    </span>
  );
}
