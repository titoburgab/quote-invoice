import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-faint">
        Quotes &amp; Invoices
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink">Ledger</h1>
      <LoginForm next={next ?? "/"} />
    </div>
  );
}
