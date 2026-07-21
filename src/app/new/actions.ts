"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { draftDocument, findClientByEmail, listClients, upsertClient } from "@/lib/mock-data";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optionalStr(formData: FormData, key: string): string | undefined {
  const value = str(formData, key);
  return value || undefined;
}

function optionalNumber(formData: FormData, key: string): number | undefined {
  const value = str(formData, key);
  return value ? Number(value) : undefined;
}

export async function createDraft(formData: FormData) {
  const type = str(formData, "type") === "invoice" ? "invoice" : "quote";

  const client =
    str(formData, "clientMode") === "existing"
      ? (await listClients()).find((c) => c.id === str(formData, "existingClientId")) ??
        (await findClientByEmail(str(formData, "clientEmail")))
      : await upsertClient({
          name: str(formData, "clientName"),
          email: str(formData, "clientEmail"),
          company: optionalStr(formData, "clientCompany"),
          phone: optionalStr(formData, "clientPhone"),
        });

  if (!client) {
    throw new Error("Select or enter a client before generating a draft.");
  }

  const doc = await draftDocument({
    type,
    client,
    projectTitle: str(formData, "projectTitle"),
    description: str(formData, "description"),
    notes: optionalStr(formData, "notes"),
    estimatedHours: optionalNumber(formData, "estimatedHours"),
    rateType: str(formData, "rateType") === "fixed" ? "fixed" : "hourly",
    rate: optionalNumber(formData, "rate"),
    validUntil: optionalStr(formData, "validUntil"),
    billingPeriod: optionalStr(formData, "billingPeriod"),
    linkedQuoteId: optionalStr(formData, "linkedQuoteId"),
    paymentTerms: optionalStr(formData, "paymentTerms"),
    dueDate: optionalStr(formData, "dueDate"),
  });

  revalidatePath("/");
  redirect(`/review/${doc.id}`);
}
