// Demo data store. Stands in for Supabase + the Claude drafting call until those
// are wired up for real. Persists via Vercel KV when configured (KV_REST_API_URL
// set — e.g. once deployed with the Upstash/KV integration attached); otherwise
// falls back to an in-memory object so local `npm run dev` needs zero setup.
// The in-memory fallback resets on server restart — the KV-backed version doesn't.

import { kv } from "@vercel/kv";

export type DocType = "quote" | "invoice";
export type Status =
  | "pending_review"
  | "sent"
  | "accepted"
  | "paid"
  | "overdue"
  | "expired";

export type LineItem = {
  description: string;
  qty: number;
  rate: number;
  amount: number;
};

export type Client = {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
};

export type Document = {
  id: string;
  type: DocType;
  documentNumber?: string;
  client: Client;
  projectTitle: string;
  description: string;
  status: Status;
  createdAt: string;

  // AI-drafted content (faked here instead of calling Claude)
  summary: string;
  lineItems: LineItem[];
  total: number;
  termsText: string;
  notesText: string;

  // rate terms (shown for both quotes and invoices)
  estimatedHours?: number;
  rateType?: "hourly" | "fixed";
  rate?: number;

  // quote-specific
  validUntil?: string;

  // invoice-specific
  billingPeriod?: string;
  linkedQuoteId?: string;
  paymentTerms?: string;
  dueDate?: string;
};

type Counters = { quote: number; invoice: number };

const SEED_CLIENTS: Client[] = [
  {
    id: "client_1",
    name: "Jamie Rivera",
    company: "Acme Studio",
    email: "jamie@acmestudio.example",
  },
  {
    id: "client_2",
    name: "Priya Nair",
    company: "Northwind Labs",
    email: "priya@northwindlabs.example",
  },
];

const SEED_DOCUMENTS: Document[] = [
  {
    id: "seed-doc-1",
    type: "invoice",
    documentNumber: "INV-2026-001",
    client: SEED_CLIENTS[0],
    projectTitle: "Brand refresh — June retainer",
    description: "Monthly retainer for ongoing brand design support.",
    status: "sent",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    summary: "June retainer covering brand design support for Acme Studio.",
    lineItems: [
      { description: "Brand design retainer — June", qty: 1, rate: 2400, amount: 2400 },
    ],
    total: 2400,
    termsText: "Payment due within 15 days of invoice date.",
    notesText: "Thanks for another great month!",
    billingPeriod: "June 2026",
    paymentTerms: "Net 15",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().slice(0, 10),
  },
];

const SEED_COUNTERS: Counters = { quote: 0, invoice: 1 }; // seed doc above already used 001

// --- storage backend ---

const usingKv = Boolean(process.env.KV_REST_API_URL);
const memory = new Map<string, unknown>();

async function readKey<T>(key: string, seed: T): Promise<T> {
  if (usingKv) {
    const value = await kv.get<T>(key);
    if (value !== null && value !== undefined) return value;
    await kv.set(key, seed);
    return seed;
  }
  if (!memory.has(key)) memory.set(key, seed);
  return memory.get(key) as T;
}

async function writeKey<T>(key: string, value: T): Promise<void> {
  if (usingKv) {
    await kv.set(key, value);
  } else {
    memory.set(key, value);
  }
}

const getClients = () => readKey<Client[]>("quote-invoice:clients", SEED_CLIENTS);
const saveClients = (clients: Client[]) => writeKey("quote-invoice:clients", clients);
const getDocuments = () => readKey<Document[]>("quote-invoice:documents", SEED_DOCUMENTS);
const saveDocuments = (documents: Document[]) => writeKey("quote-invoice:documents", documents);
const getCounters = () => readKey<Counters>("quote-invoice:counters", SEED_COUNTERS);
const saveCounters = (counters: Counters) => writeKey("quote-invoice:counters", counters);

function nextDocumentNumber(type: DocType, counters: Counters) {
  const year = new Date().getFullYear();
  if (type === "quote") {
    counters.quote += 1;
    return `Q-${year}-${String(counters.quote).padStart(3, "0")}`;
  }
  counters.invoice += 1;
  return `INV-${year}-${String(counters.invoice).padStart(3, "0")}`;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function listClients(): Promise<Client[]> {
  return getClients();
}

export async function findClientByEmail(email: string): Promise<Client | undefined> {
  const clients = await getClients();
  return clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export async function upsertClient(input: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
}): Promise<Client> {
  const clients = await getClients();
  const existing = clients.find((c) => c.email.toLowerCase() === input.email.toLowerCase());
  if (existing) return existing;
  const client: Client = { id: generateId(), ...input };
  clients.push(client);
  await saveClients(clients);
  return client;
}

export type DraftInput = {
  type: DocType;
  client: Client;
  projectTitle: string;
  description: string;
  notes?: string;
  estimatedHours?: number;
  rateType?: "hourly" | "fixed";
  rate?: number;
  validUntil?: string;
  billingPeriod?: string;
  linkedQuoteId?: string;
  paymentTerms?: string;
  dueDate?: string;
};

/** Stands in for the n8n intake webhook + Claude drafting call. */
export async function draftDocument(input: DraftInput): Promise<Document> {
  const doc: Document = {
    id: generateId(),
    type: input.type,
    client: input.client,
    projectTitle: input.projectTitle,
    description: input.description,
    status: "pending_review",
    createdAt: new Date().toISOString(),
    ...draftContent(input),
    estimatedHours: input.estimatedHours,
    rateType: input.rateType,
    rate: input.rate,
    validUntil: input.validUntil,
    billingPeriod: input.billingPeriod,
    linkedQuoteId: input.linkedQuoteId,
    paymentTerms: input.paymentTerms,
    dueDate: input.dueDate,
  };

  const documents = await getDocuments();
  documents.unshift(doc);
  await saveDocuments(documents);
  return doc;
}

export async function getDocument(id: string): Promise<Document | undefined> {
  const documents = await getDocuments();
  return documents.find((d) => d.id === id);
}

export async function listDocuments(): Promise<Document[]> {
  return getDocuments();
}

/** Persists edits made on the review page (the "Edit before sending" form). */
export async function saveDocument(doc: Document): Promise<void> {
  const documents = await getDocuments();
  const index = documents.findIndex((d) => d.id === doc.id);
  if (index !== -1) documents[index] = doc;
  await saveDocuments(documents);
}

/** Stands in for the n8n approval webhook (assign number, "send" email, archive). */
export async function approveDocument(id: string): Promise<Document | undefined> {
  const doc = await getDocument(id);
  if (!doc) return undefined;
  const counters = await getCounters();
  doc.documentNumber = nextDocumentNumber(doc.type, counters);
  doc.status = "sent";
  await saveCounters(counters);
  await saveDocument(doc);
  return doc;
}

function draftContent(input: DraftInput): Pick<Document, "summary" | "lineItems" | "total" | "termsText" | "notesText"> {
  const isHourly = input.rateType === "hourly";
  const qty = isHourly ? input.estimatedHours ?? 1 : 1;
  const rate = isHourly ? input.rate ?? 0 : input.rate ?? 0;
  const amount = isHourly ? qty * (input.rate ?? 0) : input.rate ?? 0;

  const lineItems: LineItem[] = [
    {
      description: input.projectTitle,
      qty,
      rate,
      amount,
    },
  ];

  const description = (input.description || "no additional description provided").replace(/\.+$/, "");

  return {
    summary: `${input.type === "quote" ? "Quote" : "Invoice"} for "${input.projectTitle}" — ${description}.`,
    lineItems,
    total: amount,
    termsText:
      input.type === "quote"
        ? `This quote is valid until ${input.validUntil || "30 days from issue"}.`
        : `Payment due by ${input.dueDate || "the due date"} (${input.paymentTerms || "terms TBD"}).`,
    notesText: input.notes || "",
  };
}

/** Re-runs the fake drafting step with the same inputs — stands in for "Regenerate". */
export async function regenerateDocument(id: string): Promise<Document | undefined> {
  const doc = await getDocument(id);
  if (!doc) return undefined;
  Object.assign(doc, draftContent({ ...doc, notes: doc.notesText }));
  await saveDocument(doc);
  return doc;
}
