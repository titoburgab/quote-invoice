type PageProps = {
  params: Promise<{ review_id: string }>;
};

export default async function ReviewPage({ params }: PageProps) {
  const { review_id } = await params;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-xl font-semibold">Review {review_id}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Placeholder. Will fetch the draft (PDF preview + editable fields) for
        this review ID from Supabase, and offer &quot;Approve &amp;
        Send&quot; (POSTs to the n8n approval webhook) and
        &quot;Regenerate&quot; actions.
      </p>
    </div>
  );
}
