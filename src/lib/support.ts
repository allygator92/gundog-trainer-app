export const SUPPORT_KINDS = ["bug", "change", "feature"] as const;
export const SUPPORT_STATUSES = ["submitted", "investigating", "needs_feedback", "resolved"] as const;

export type SupportKind = (typeof SUPPORT_KINDS)[number];
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_STATUS_STEPS = [
  { id: "submitted", label: "Received" },
  { id: "investigating", label: "Investigating" },
  { id: "needs_feedback", label: "Needs reply" },
  { id: "resolved", label: "Fixed" },
] as const satisfies ReadonlyArray<{ id: SupportStatus; label: string }>;

const DEFAULT_DEVELOPER_EMAIL = "alisongrant141@gmail.com";

export function getDeveloperEmail(env: Record<string, string | undefined> = process.env): string {
  const configured = env.DEVELOPER_EMAIL?.trim();
  return configured || DEFAULT_DEVELOPER_EMAIL;
}

export function isSupportKind(value: string): value is SupportKind {
  return (SUPPORT_KINDS as readonly string[]).includes(value);
}

export function isSupportStatus(value: string): value is SupportStatus {
  return (SUPPORT_STATUSES as readonly string[]).includes(value);
}

export function supportStatusStepIndex(status: SupportStatus): number {
  return SUPPORT_STATUS_STEPS.findIndex((step) => step.id === status);
}
