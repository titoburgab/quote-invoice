import Link from "next/link";
import { listDocuments } from "@/lib/mock-data";

export default function Home() {
  const documents = listDocuments();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Quote & Invoice
        </h1>
        <Link
          href="/new"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          New Quote / Invoice
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Recent documents
        </h2>
        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nothing yet — create one above.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/review/${doc.id}`}
                  className="flex items-center justify-between py-3 text-sm hover:underline"
                >
                  <span>
                    <span className="capitalize">{doc.type}</span> — {doc.projectTitle} ·{" "}
                    {doc.client.name}
                  </span>
                  <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs uppercase tracking-wide dark:bg-zinc-800">
                    {doc.status.replace("_", " ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
