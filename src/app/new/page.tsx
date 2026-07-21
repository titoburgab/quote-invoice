import Link from "next/link";
import { listClients } from "@/lib/mock-data";
import { createDraft } from "./actions";
import { NewDocumentForm } from "./NewDocumentForm";

export default async function NewDocumentPage() {
  const clients = await listClients();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint hover:text-ink"
      >
        ← Ledger
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink">
        New document
      </h1>
      <p className="mt-2 mb-8 text-sm text-ink-soft">
        This is a demo build — drafting fakes the AI step locally instead of
        calling n8n and Claude, then takes you straight to the review page.
      </p>
      <NewDocumentForm clients={clients} action={createDraft} />
    </div>
  );
}
