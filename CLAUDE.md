# CLAUDE.md

@AGENTS.md

## Project Overview

AI-powered quote & invoice generation for a freelance/agency business. Replaces manual
document creation with a human-in-the-loop pipeline:

**Vercel Form → n8n + Claude API drafting → Vercel Review/Approval → n8n Send & Archive**

The AI drafts every quote/invoice as structured JSON; a human always approves before anything
is sent to a client. Full requirements: [assets/quote-invoice.md](assets/quote-invoice.md).

## Architecture

| Layer | Tool | Role |
|---|---|---|
| Frontend | Vercel (Next.js, App Router, TypeScript) | Form page (`/new`) + review/approval page (`/review/[review_id]`). No business logic — UI + API calls only. |
| Orchestration | n8n | All business logic: Claude calls, PDF generation, DB reads/writes, email sending, recurring schedules. |
| AI drafting | Claude API (called from n8n) | Returns structured JSON only (line items, summary, terms) — never freeform formatted text. |
| PDF generation | Carbone.io or Puppeteer (via n8n) | Merges AI JSON into a branded HTML/PDF template. |
| Database | Supabase (Postgres) | Shared source of truth for both Vercel and n8n. Tables: `clients`, `quotes`, `invoices`. |
| Email | Resend (or SMTP via n8n) | Sends final PDF to the client. |
| Storage | Supabase Storage or Google Drive | Archives every generated PDF. |

### Vercel ↔ n8n communication

- Vercel **never** talks to Claude, Postgres, or email providers directly — it only calls n8n
  webhooks and reads Supabase for display.
- Two n8n webhooks drive the flow:
  1. **Intake webhook** — form submit → client check → AI draft → PDF → save as `pending_review` → returns `review_id`.
  2. **Approval webhook** — "Approve & Send" → assign final doc number → email PDF → archive → update status to `sent`.
- Additional n8n entry points: Quote→Invoice conversion webhook, and a Cron trigger for
  recurring monthly invoices.
- The two layers fail independently: if n8n is down, the Vercel UI still loads (shows
  "processing" instead of erroring).
- n8n workflows are kept **modular** (4 separate workflows, not one monolith):
  1. Intake → AI Draft → Save
  2. Approval → Send → Archive
  3. Quote → Invoice Conversion
  4. Recurring Invoice Scheduler

### Status lifecycle

`draft → pending_review → sent → accepted/paid → overdue/expired`

## WAT Framework (how this repo is organized)

- **Workflows** (`/workflows/`) — step-by-step procedure docs in Markdown. When you (Claude
  Code) need to do a recurring task (set up local dev, add a tool, update an n8n workflow,
  update the PDF template or Claude prompt, deploy the frontend), check here first for the
  documented procedure before improvising.
- **Agent** — Claude Code (this file defines how the agent should behave; no folder needed).
- **Tools** (`/tools/`) — scripts and integrations, grouped by service:
  - `tools/supabase/` — migrations, seed scripts
  - `tools/n8n/` — helper scripts for interacting with n8n (export/import, etc.)
  - `tools/pdf/` — HTML/PDF templates and render scripts
  - `tools/email/` — email sending/test scripts
- **`/temp/`** — scratch space, never committed meaningfully long-term:
  - `temp/outputs/` — generated files (draft PDFs, test output) during a working session
  - `temp/resources/` — working copies of reference material pulled in for a task
- **`.env`** — API keys & secrets (Supabase, Claude, Resend, n8n webhook auth). Never committed;
  see `.env.example` for the required keys.

## Conventions

- Frontend: Next.js App Router, TypeScript, npm. Keep Vercel **logic-free** — all business
  rules live in n8n so they can be edited visually without a redeploy.
- AI output contract: Claude must always return the fixed JSON shape (`document_number`,
  `summary`, `line_items[]`, `total`, `terms_text`, `notes_text`) — never raw formatted text.
  Any change to this contract must be reflected in both the n8n prompt and the PDF template.
- Document numbering (e.g. `Q-2026-014`, `INV-2026-014`) is assigned server-side (Postgres
  sequence or n8n counter) at send time, not at draft time — avoids gaps/duplicates from
  regenerated drafts.
- `line_items` are stored as `jsonb` — no separate line-items table unless per-item reporting
  is needed later.
- Version the Claude prompt and the HTML/PDF template as files in the repo (not buried in n8n
  node configs), so changes are diffable.
- No test framework yet (Phase 1 is a small internal tool) — revisit once the app grows.

## Setup / Commands

> Stubbed — filled in once the Next.js app and Supabase project are scaffolded.

- Frontend dev server: `npm run dev` (from repo root, once `package.json` exists)
- Supabase: local CLI commands TBD (`supabase start`, migrations in `tools/supabase/migrations/`)
- n8n: cloud/self-hosted instance — no local run; changes made via n8n UI, workflows referenced
  (not exported) for now per `workflows/update-n8n-workflow.md`

## Claude Code-Specific Instructions

- Before implementing a feature, check `/workflows/` for an existing procedure doc covering it.
- Read `assets/quote-invoice.md` for full requirements context before making architectural
  decisions — treat it as the source of truth for scope/behavior, and this file as the source
  of truth for repo conventions/structure.
- Never commit `.env` or any file containing real API keys/secrets.
- When adding a new script or integration, put it under the matching `tools/<integration>/`
  folder, not at the repo root.
- Use `temp/outputs/` for any generated file you produce while working (draft PDFs, test
  payloads) instead of littering the repo root.
- This project has no test suite yet — verify changes by running the dev server / calling
  n8n webhooks directly (e.g. via curl) rather than writing tests, until a framework is added.

## Open Questions / Assumptions

- **Next.js app location**: assumed to live at repo root (`app/`, `components/`, `lib/` as
  siblings of `/workflows/`, `/tools/`, `/temp/`) rather than a nested `/frontend/` subfolder.
  Confirm before scaffolding the app.
- **n8n workflows are not version-controlled** — they live only inside the n8n instance.
  Exporting them to `tools/n8n/` as JSON is a possible future enhancement, not done yet.
- **Git repo**: not yet initialized. Run `git init` when ready.
- **PDF engine**: Carbone.io vs Puppeteer not yet decided — pick when building `tools/pdf/`.
- **`review_id` access control**: private/unguessable ID vs basic auth not yet decided — pick
  when building the Vercel review page.
