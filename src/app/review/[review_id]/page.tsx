import { notFound } from "next/navigation";
import { getDocument } from "@/lib/mock-data";
import { approveAction, regenerateAction, updateDraftAction } from "./actions";

type PageProps = {
  params: Promise<{ review_id: string }>;
};

const fieldClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default async function ReviewPage({ params }: PageProps) {
  const { review_id } = await params;
  const doc = getDocument(review_id);
  if (!doc) notFound();

  const boundApprove = approveAction.bind(null, doc.id);
  const boundRegenerate = regenerateAction.bind(null, doc.id);
  const boundUpdate = updateDraftAction.bind(null, doc.id);
  const isPending = doc.status === "pending_review";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold capitalize">{doc.type} review</h1>
        <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium uppercase tracking-wide dark:bg-zinc-800">
          {doc.status.replace("_", " ")}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        {doc.documentNumber ?? "Not yet numbered"} · {doc.client.name} ({doc.client.email})
      </p>

      {/* Fake "PDF preview" */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">{doc.projectTitle}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{doc.summary}</p>
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {doc.lineItems.map((item, i) => (
              <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.qty}</td>
                <td className="py-2 text-right">${item.rate.toFixed(2)}</td>
                <td className="py-2 text-right">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end text-sm font-semibold">
          Total: ${doc.total.toFixed(2)}
        </div>
        <p className="mt-6 text-xs text-zinc-500">{doc.termsText}</p>
        {doc.notesText && <p className="mt-2 text-xs text-zinc-500">Notes: {doc.notesText}</p>}
      </div>

      {isPending && (
        <form
          action={boundUpdate}
          className="mt-8 flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Edit before sending
          </h2>
          <div>
            <label className="block text-sm font-medium">Summary</label>
            <textarea name="summary" defaultValue={doc.summary} rows={2} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm font-medium">Total ($)</label>
            <input name="total" type="number" step="0.01" defaultValue={doc.total} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm font-medium">Terms</label>
            <textarea name="termsText" defaultValue={doc.termsText} rows={2} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea name="notesText" defaultValue={doc.notesText} rows={2} className={fieldClass} />
          </div>
          <button
            type="submit"
            className="self-start rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Save changes
          </button>
        </form>
      )}

      <div className="mt-8 flex gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <form action={boundApprove}>
          <button
            type="submit"
            disabled={!isPending}
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
          >
            Approve & Send
          </button>
        </form>
        <form action={boundRegenerate}>
          <button
            type="submit"
            disabled={!isPending}
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
          >
            Regenerate
          </button>
        </form>
      </div>
    </div>
  );
}
