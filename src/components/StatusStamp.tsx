import type { Status } from "@/lib/mock-data";

const STAMP_LABEL: Partial<Record<Status, string>> = {
  sent: "Sent",
  accepted: "Accepted",
  paid: "Paid",
  overdue: "Overdue",
  expired: "Expired",
};

type Props = {
  status: Status;
  /** Small circular seal for list rows vs. a larger rotated stamp for the document preview. */
  variant?: "seal" | "stamp";
};

/**
 * A document only gets stamped once a real event has happened to it (sent, paid, etc).
 * Drafts and pending-review documents stay unmarked, like blank paper — the stamp is
 * earned, not decorative.
 */
export function StatusStamp({ status, variant = "seal" }: Props) {
  const label = STAMP_LABEL[status];

  if (!label) {
    return (
      <span className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
        Pending review
      </span>
    );
  }

  if (variant === "stamp") {
    return (
      <div
        className="pointer-events-none absolute -right-3 -top-3 rotate-[-9deg] select-none rounded-sm border-[3px] border-double border-stamp px-4 py-1.5 font-mono text-lg font-semibold uppercase tracking-[0.2em] text-stamp opacity-90 motion-safe:animate-[stamp-in_0.4s_ease-out]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--stamp) 8%, transparent)",
        }}
      >
        {label}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border-2 border-stamp px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-stamp">
      {label}
    </span>
  );
}
