"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink-soft">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-ink outline-none focus:border-ink"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-stamp">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-ink px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-bg disabled:opacity-60"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
