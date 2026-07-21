# AI-Powered Quote & Invoice Workflow — Implementation Plan
*(Finalized Architecture: Vercel + n8n + Supabase)*

## 1. Goal

Replace manual quote/invoice creation with a semi-automated pipeline:
**Vercel Form → n8n + AI drafting → Vercel Review/Approval → n8n Send & Archive.**

You review and approve every document before it goes to a client, but the AI does the writing/formatting, and the system handles storage, numbering, and delivery automatically.

---

## 2. Finalized Tool Stack

| Layer | Tool | Role |
|---|---|---|
| **Frontend / UI** | **Vercel (Next.js)** | Hosts the form page and the review/approval page. A clean, branded link you (or later, clients) open — no logic lives here, just UI and API calls to n8n/Supabase |
| **Orchestration / business logic** | **n8n** | Handles everything behind the scenes: talks to Claude, generates PDFs, writes to the database, sends emails, runs recurring invoice schedules |
| **AI drafting** | **Claude API** (via n8n) | Generates structured JSON content (line items, summary, terms) — never raw formatted text, so branding stays consistent |
| **Document generation** | **Carbone.io or Puppeteer** (via n8n) | Merges the AI's JSON output into your branded HTML/PDF template |
| **Database** | **Supabase (Postgres)** | Shared source of truth — both Vercel (for display) and n8n (for processing) read/write here. Includes a spreadsheet-style table editor, so no deep SQL knowledge required |
| **Email delivery** | **Resend** (or Gmail/SMTP via n8n) | Sends the final PDF to the client |
| **Storage/archive** | Supabase Storage or Google Drive | Permanent copy of every generated PDF, linked to its database record |

### Why this split
- **Vercel** stays lightweight — just two pages (form + review), playing to your front-end/design background.
- **n8n** holds all the logic that's likely to change over time (prompts, PDF templates, email wording, new automations). You can edit this visually, without redeploying code — important since you're not a full-time developer.
- The two layers **fail independently**: if n8n has an issue, your client-facing UI still loads; it just shows "processing."
- **Supabase** scales further than Airtable and has a built-in API both Vercel and n8n can call directly.

---

## 3. Complete Workflow (Step-by-Step)

### Step 1 — Form (Vercel)
User opens your Vercel link → `/new` page → selects **Generate Quote** or **Generate Invoice**, which conditionally reveals the right fields:
- Client info (or select existing client from a dropdown populated via Supabase)
- Project title, description, notes
- **If Quote**: estimated hours, rate type (hourly/fixed), rate/price, validity period
- **If Invoice**: billing period, linked quote (optional), payment terms, due date

### Step 2 — Submit → n8n Webhook
On submit, the Vercel app **POSTs the form data to an n8n webhook**. n8n takes over from here.

### Step 3 — Client Record Check (n8n → Supabase)
n8n checks Supabase for an existing client by email; creates a new record if none exists.

### Step 4 — AI Drafting (n8n → Claude API)
n8n sends the form data to Claude with a prompt that includes your branding voice and instructions to return **structured JSON only**:
```json
{
  "document_number": "",
  "summary": "1-2 sentence project summary",
  "line_items": [{"description": "", "qty": 1, "rate": 0, "amount": 0}],
  "total": 0,
  "terms_text": "",
  "notes_text": ""
}
```

### Step 5 — PDF Generation (n8n → Carbone.io/Puppeteer)
The JSON is merged into your branded HTML template and rendered as a PDF.

### Step 6 — Save Draft (n8n → Supabase)
n8n writes a new record (status = `pending_review`) with the AI output and PDF link, and returns a `review_id` to Vercel.

### Step 7 — Review & Approval (Vercel)
Vercel redirects to `/review/[review_id]`, which pulls the draft + PDF preview from Supabase. You see:
- PDF preview
- Editable fields (line items, totals, notes)
- **Approve & Send** button
- **Regenerate** button (re-runs Step 4–5 with your edits, if needed)

This page stays **internal-only** for now — private to you, not client-facing. (Client-facing acceptance is a good Phase 2 feature — see Section 8.)

### Step 8 — Approve → n8n Webhook
Clicking **Approve & Send** POSTs to a second n8n webhook, which:
1. Assigns the final document number (e.g., `Q-2026-014` / `INV-2026-014`)
2. Emails the PDF to the client via Resend
3. Archives the file in Supabase Storage / Google Drive
4. Updates the Supabase record status to `sent`

### Step 9 — Status Tracking
Every record moves through: `draft → pending_review → sent → accepted/paid → overdue/expired` (visible in a simple Vercel dashboard page or directly in Supabase's table editor).

---

## 4. Data to Store (Supabase / Postgres)

**`clients`**
`id | name | company | email | phone | client_type | created_at | notes`

**`quotes`**
`id | client_id (FK) | project_title | description | line_items (jsonb) | estimated_hours | rate_type | total | status | valid_until | created_at | approved_at | pdf_url | converted_invoice_id (FK, nullable)`

**`invoices`**
`id | client_id (FK) | linked_quote_id (FK, nullable) | project_title | billing_period | line_items (jsonb) | total | payment_terms | due_date | status | sent_at | paid_at | pdf_url`

Using `jsonb` for line items keeps the schema simple while still queryable — no need for a separate line-items table unless you want granular per-item reporting later.

---

## 5. Approval Process (Human-in-the-Loop)

- The AI **never** sends anything directly to a client.
- The workflow **pauses** after Step 6 and waits for your action on the Vercel review page.
- Two actions only: **Approve & Send** (triggers Step 8) or **Regenerate** (loops back to Step 4 with your edits factored in).
- Because Vercel and n8n are decoupled, you can review from any device via the link — no need to log into n8n or Supabase directly.

---

## 6. Quote → Invoice Conversion

1. When a client accepts a quote, mark its status `accepted` (manually, or later via a client-facing acceptance page).
2. A **"Convert to Invoice"** button on the quote's detail page (Vercel) calls an n8n webhook that:
   - Copies client info, project title, description, and line items into a new `invoices` record
   - Pre-fills billing period = current month, payment terms = your default, due date = auto-calculated
   - Sets `linked_quote_id` for traceability
   - Runs the same drafting → PDF → review → send pipeline, but pre-populated so you're only reviewing, not re-entering data

**Recurring monthly invoices** (retainer clients): an n8n Cron trigger runs monthly, pulls active retainer clients from Supabase, and auto-generates draft invoices that land directly in your Vercel review queue — no blank form needed.

---

## 7. Scalability, Maintainability & Non-Technical Usability

- **Structured JSON, not freeform AI text** — keeps every document visually consistent with your branding, regardless of what Claude generates.
- **Version your Claude prompt and HTML/PDF template as separate files** (in your repo or an n8n data store), so updates (new logo, new terms language) are quick edits, not a hunt through workflow nodes.
- **Keep Vercel logic-free.** All business logic lives in n8n so you can adjust it visually without redeploying the app.
- **Modular n8n workflows** — build as 4 separate workflows rather than one giant one:
  1. Intake → AI Draft → Save
  2. Approval → Send → Archive
  3. Quote → Invoice Conversion
  4. Recurring Invoice Scheduler
  This makes debugging and updates independent and low-risk.
- **Error handling**: an n8n error-trigger workflow emails/Slacks you if the AI call, PDF generation, or email send fails.
- **Auto-numbering**: handled by a Postgres sequence or n8n counter — avoids manual/duplicate numbering.
- **Access control**: Supabase row-level security restricts data access; Vercel review pages use a private/unguessable `review_id` (or basic auth) since only you should see them initially.
- **Future scalability**: adding a client-facing acceptance page with e-signature (e.g., via Documenso or DocuSign) or payment status tracking (Stripe webhook) plugs into this architecture as new steps — no rebuild required.

---

## 8. Suggested Build Order (Phased)

1. **Phase 1**: Supabase schema (clients/quotes/invoices) + Vercel form page → n8n webhook → AI draft → Vercel review page (manual send, no automation yet)
2. **Phase 2**: Add n8n Approve webhook → auto-send email → archive to storage
3. **Phase 3**: Add Quote → Invoice conversion button + workflow
4. **Phase 4**: Add recurring monthly invoice scheduler (n8n Cron)
5. **Phase 5** (optional): Client-facing quote acceptance page + e-signature + Stripe payment tracking

---

**Next step**: With this architecture locked in, the next concrete steps are (a) the Supabase schema/migration, (b) the Vercel/Next.js app scaffold (form + review pages), and (c) the n8n webhook workflows. Let me know which you'd like to start with.
