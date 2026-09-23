import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16 sm:px-10">
      <header className="flex items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-faint">
            Quotes &amp; Invoices
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink">
            Ledger
          </h1>
        </div>
        <Link
          href="/new"
          className="shrink-0 rounded-md bg-ink px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-bg transition-transform hover:-translate-y-0.5 hover:shadow-md"
        >
          + New
        </Link>
      </header>

      <section className="mt-10 flex-1">
        <div className="rounded-lg border border-dashed border-line px-6 py-12 text-center">
          <p className="text-ink-soft">Start a new quote or invoice.</p>
          <Link
            href="/new"
            className="mt-4 inline-block font-medium text-ink underline underline-offset-4"
          >
            Draft a document
          </Link>
        </div>
      </section>
    </div>
  );
}
