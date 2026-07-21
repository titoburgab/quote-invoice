import { listClients } from "@/lib/mock-data";
import { createDraft } from "./actions";
import { NewDocumentForm } from "./NewDocumentForm";

export default function NewDocumentPage() {
  const clients = listClients();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-xl font-semibold">New Quote / Invoice</h1>
      <p className="mt-2 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        This is a demo build: submitting fakes the AI drafting step locally
        instead of calling n8n/Claude, then takes you to the review page.
      </p>
      <NewDocumentForm clients={clients} action={createDraft} />
    </div>
  );
}
