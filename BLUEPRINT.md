# BLUEPRINT: ASTRA-11 Quote & Invoice (Ledger)

_Last updated: 2026-11-04_

## 1. Working on
AI-assisted quote/invoice app (Next.js on Vercel, backend still faked in `src/lib/mock-data.ts`). This session: put the whole app behind a single shared-password login so the demo isn't publicly open. Full architecture/requirements: `CLAUDE.md`, `assets/quote-invoice.md`.

## 2. Where we are
- Done: password-only login (`USER_PASSWORD` env var) gating every route. Committed and pushed as `f5dc604` on `main` (`origin` = git@github.com:titoburgab/quote-invoice.git). User confirmed "it works now" (deployed/running version) — `verified by user`.
- Tested by me: `npx tsc --noEmit` and `npm run lint` clean; with dev server on :3111, `/` and `/review/x` returned 307 -> `/login` (with `?next=` for non-root), `/login` returned 200. The actual password-submit flow was not tested by me; the user confirmed it works.
- In progress: nothing.
- Next step: not defined by the user. Candidates from CLAUDE.md: Supabase schema (`clients`/`quotes`/`invoices`) or a real n8n intake workflow.
- To check / report back: `USER_PASSWORD` must be set in Vercel env vars (user says it works, so presumably done — unverified by me). Working tree was clean before this checkpoint; `BLUEPRINT.md` and the CLAUDE.md pointer line are new and uncommitted (user will decide on commit/push).

## 3. Files in use
- `src/proxy.ts`: Next 16 proxy (renamed middleware); redirects unauthenticated requests to `/login`; matcher excludes `_next/static`, `_next/image`, favicon (new)
- `src/lib/auth.ts`: Web-Crypto HMAC session token keyed by `USER_PASSWORD`, constant-time compare, fails closed if unset (new)
- `src/app/login/page.tsx`, `LoginForm.tsx`, `actions.ts`: login UI, `login`/`logout` server actions, 30-day httpOnly cookie `ledger_session`, same-site `next` redirect only (new)
- `src/app/page.tsx`: added "Sign out" button (changed)
- `.env.example`: added `USER_PASSWORD=` (changed). `.env` holds the real value (gitignored, never read into docs).
- `CLAUDE.md`: access-control open question rewritten (changed)
- `src/lib/mock-data.ts`: fake Supabase/n8n/Claude layer; Vercel KV if `KV_REST_API_URL` set (not changed)

## 4. Changes
### 2026-11-04
- Added password-only login: `src/proxy.ts`, `src/lib/auth.ts`, `src/app/login/*`; sign-out button on home page; `USER_PASSWORD` documented in `.env.example`; CLAUDE.md access-control note updated. Commit `f5dc604`, pushed to `origin/main`.
- Added this `BLUEPRINT.md` and a pointer line in `CLAUDE.md` (uncommitted).

## 5. Failures
- [resolved] User reported "it doesn't ask for password": port 3000 was a different project's dev server (`/Volumes/ASTRA11-v1/_PROJECTS/Tito Dashboard/dashboard`), and the login commit was not yet pushed. Resolved after pushing/running this project; user confirmed it works.
- [resolved] My earlier answer "not connected to GitHub" was wrong: repo has an `origin` remote. CLAUDE.md simply doesn't mention it.

## 6. Lessons
### "Login doesn't appear" (2026-11-04)
- Tried: user opened localhost:3000 / the site expecting the login.
- Error / symptom: no password prompt; `curl localhost:3000/` returned 200 with no redirect.
- Cause: port 3000 was served by an unrelated project's `next-server`; also the commit wasn't pushed for the Vercel site.
- Fix: run `npm run dev` in this project folder and use the port it prints; push and set `USER_PASSWORD` in Vercel.
- Next time: check `lsof -p <pid> -d cwd` on the listening process before debugging code.

### Next.js 16 specifics (2026-11-04)
- `middleware.ts` is deprecated; use `src/proxy.ts` exporting `proxy`. AGENTS.md says to read `node_modules/next/dist/docs/` before writing Next code.
- CLAUDE.md can be stale about infra (it said nothing about the GitHub remote) — verify with `git remote -v`.
