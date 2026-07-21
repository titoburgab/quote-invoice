export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-xl font-semibold">New Quote / Invoice</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Form placeholder. On submit, this page will POST to the n8n intake
        webhook (see <code>N8N_INTAKE_WEBHOOK_URL</code>) and redirect to{" "}
        <code>/review/[review_id]</code> using the returned ID.
      </p>
    </div>
  );
}
