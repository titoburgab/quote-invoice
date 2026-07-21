import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocument } from "@/lib/mock-data";
import { StatusStamp } from "@/components/StatusStamp";
import { approveAction, regenerateAction, updateDraftAction } from "./actions";

type PageProps = {
  params: Promise<{ review_id: string }>;
};

const fieldClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";
const fieldLabel = "block text-sm font-medium text-ink-soft";

export default async function ReviewPage({ params }: PageProps) {
  const { review_id } = await params;
  const doc = await getDocument(review_id);
  if (!doc) notFound();

  const boundApprove = approveAction.bind(null, doc.id);
  const boundRegenerate = regenerateAction.bind(null, doc.id);
  const boundUpdate = updateDraftAction.bind(null, doc.id);
  const isPending = doc.status === "pending_review";

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint hover:text-ink"
      >
        ← Ledger
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium capitalize tracking-tight text-ink">
          {doc.type} review
        </h1>
        <StatusStamp status={doc.status} />
      </div>
      <p className="mt-1 font-mono text-sm text-ink-faint">
        {doc.documentNumber ?? "Not yet numbered"} · {doc.client.name} ({doc.client.email})
      </p>

      {/* Document preview — stands in for the branded PDF */}
      <div className="relative mt-8 rounded-lg border border-paper-line bg-paper p-8 text-paper-ink shadow-sm">
        {!isPending && <StatusStamp status={doc.status} variant="stamp" />}

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
          {doc.type}
        </p>
        <h2 className="mt-1 font-display text-xl font-medium">{doc.projectTitle}</h2>
        <p className="mt-2 text-sm text-ink-soft">{doc.summary}</p>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-paper-line text-left font-mono text-xs uppercase tracking-wider text-ink-soft">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Rate</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {doc.lineItems.map((item, i) => (
              <tr key={i} className="border-b border-paper-line/60">
                <td className="py-2 font-sans">{item.description}</td>
                <td className="py-2 text-right">{item.qty}</td>
                <td className="py-2 text-right">${item.rate.toFixed(2)}</td>
                <td className="py-2 text-right">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-baseline justify-end gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">Total</span>
          <span className="font-mono text-2xl font-semibold">${doc.total.toFixed(2)}</span>
        </div>
        <p className="mt-6 text-xs text-ink-soft">{doc.termsText}</p>
        {doc.notesText && <p className="mt-2 text-xs text-ink-soft">Notes: {doc.notesText}</p>}
      </div>

      {isPending ? (
        <>
          <form
            action={boundUpdate}
            className="mt-8 flex flex-col gap-4 border-t border-line pt-6"
          >
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
              Edit before sending
            </h2>
            <div>
              <label className={fieldLabel}>Summary</label>
              <textarea name="summary" defaultValue={doc.summary} rows={2} className={fieldClass} />
            </div>
            <div>
              <label className={fieldLabel}>Total ($)</label>
              <input name="total" type="number" step="0.01" defaultValue={doc.total} className={fieldClass} />
            </div>
            <div>
              <label className={fieldLabel}>Terms</label>
              <textarea name="termsText" defaultValue={doc.termsText} rows={2} className={fieldClass} />
            </div>
            <div>
              <label className={fieldLabel}>Notes</label>
              <textarea name="notesText" defaultValue={doc.notesText} rows={2} className={fieldClass} />
            </div>
            <button
              type="submit"
              className="self-start rounded-md border border-line px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
            >
              Save changes
            </button>
          </form>

          <div className="mt-8 flex gap-3 border-t border-line pt-6">
            <form action={boundApprove}>
              <button
                type="submit"
                className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                Approve &amp; Send
              </button>
            </form>
            <form action={boundRegenerate}>
              <button
                type="submit"
                className="rounded-md border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                Regenerate
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-lg border border-line bg-surface px-6 py-5 text-sm text-ink-soft">
          Sent to <span className="font-medium text-ink">{doc.client.name}</span> as{" "}
          <span className="font-mono text-ink">{doc.documentNumber}</span>. Nothing left to do here.
        </div>
      )}
    </div>
  );
}
