import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Quote & Invoice
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Internal tool for drafting and approving client quotes and invoices.
      </p>
      <Link
        href="/new"
        className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        New Quote / Invoice
      </Link>
    </div>
  );
}
