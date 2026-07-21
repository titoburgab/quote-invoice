// In-memory demo data store. Resets whenever the dev/prod server restarts.
// Stands in for Supabase + the Claude drafting step until those are wired up for real.

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

  // quote-specific
  estimatedHours?: number;
  rateType?: "hourly" | "fixed";
  rate?: number;
  validUntil?: string;

  // invoice-specific
  billingPeriod?: string;
  linkedQuoteId?: string;
  paymentTerms?: string;
  dueDate?: string;
};

const clients: Client[] = [
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

const documents: Document[] = [
  {
    id: "seed-doc-1",
    type: "invoice",
    documentNumber: "INV-2026-001",
    client: clients[0],
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

let quoteCounter = 0;
let invoiceCounter = 1; // seed doc above already used 001

function nextDocumentNumber(type: DocType) {
  const year = new Date().getFullYear();
  if (type === "quote") {
    quoteCounter += 1;
    return `Q-${year}-${String(quoteCounter).padStart(3, "0")}`;
  }
  invoiceCounter += 1;
  return `INV-${year}-${String(invoiceCounter).padStart(3, "0")}`;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function listClients(): Client[] {
  return clients;
}

export function findClientByEmail(email: string): Client | undefined {
  return clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export function upsertClient(input: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
}): Client {
  const existing = findClientByEmail(input.email);
  if (existing) return existing;
  const client: Client = { id: generateId(), ...input };
  clients.push(client);
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
export function draftDocument(input: DraftInput): Document {
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

  documents.unshift(doc);
  return doc;
}

export function getDocument(id: string): Document | undefined {
  return documents.find((d) => d.id === id);
}

export function listDocuments(): Document[] {
  return documents;
}

/** Stands in for the n8n approval webhook (assign number, "send" email, archive). */
export function approveDocument(id: string): Document | undefined {
  const doc = getDocument(id);
  if (!doc) return undefined;
  doc.documentNumber = nextDocumentNumber(doc.type);
  doc.status = "sent";
  return doc;
}

function draftContent(input: DraftInput): Pick<Document, "summary" | "lineItems" | "total" | "termsText" | "notesText"> {
  const amount =
    input.type === "quote"
      ? input.rateType === "hourly"
        ? (input.estimatedHours ?? 0) * (input.rate ?? 0)
        : input.rate ?? 0
      : input.rate ?? 0;

  const lineItems: LineItem[] = [
    {
      description: input.projectTitle,
      qty: input.type === "quote" && input.rateType === "hourly" ? input.estimatedHours ?? 1 : 1,
      rate:
        input.type === "quote" && input.rateType === "hourly"
          ? input.rate ?? 0
          : amount,
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
export function regenerateDocument(id: string): Document | undefined {
  const doc = getDocument(id);
  if (!doc) return undefined;
  Object.assign(doc, draftContent({ ...doc, notes: doc.notesText }));
  return doc;
}
