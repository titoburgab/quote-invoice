import Link from "next/link";
import { listDocuments } from "@/lib/mock-data";
import { StatusStamp } from "@/components/StatusStamp";

// Reads live data from the store on every request — never statically cache this page.
export const dynamic = "force-dynamic";

export default async function Home() {
  const documents = await listDocuments();

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
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-ink-faint">
          Recent
        </h2>

        {documents.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-line px-6 py-12 text-center">
            <p className="text-ink-soft">
              No documents yet. Draft your first quote or invoice to get started.
            </p>
            <Link
              href="/new"
              className="mt-4 inline-block font-medium text-ink underline underline-offset-4"
            >
              Draft a document
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/review/${doc.id}`}
                  className="group flex items-center justify-between gap-6 py-4 transition-colors hover:bg-surface"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono text-xs text-ink-faint">
                      <span className="capitalize">{doc.type}</span>
                      <span aria-hidden>·</span>
                      <span>{doc.documentNumber ?? "unnumbered"}</span>
                    </div>
                    <p className="mt-0.5 truncate font-medium text-ink group-hover:underline">
                      {doc.projectTitle}
                    </p>
                    <p className="truncate text-sm text-ink-soft">{doc.client.name}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-mono text-sm text-ink">
                      ${doc.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <StatusStamp status={doc.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
