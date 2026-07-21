"use server";

import { revalidatePath } from "next/cache";
import { approveDocument, getDocument, regenerateDocument } from "@/lib/mock-data";

export async function approveAction(id: string) {
  approveDocument(id);
  revalidatePath(`/review/${id}`);
}

export async function regenerateAction(id: string) {
  regenerateDocument(id);
  revalidatePath(`/review/${id}`);
}

export async function updateDraftAction(id: string, formData: FormData) {
  const doc = getDocument(id);
  if (!doc) return;

  doc.summary = String(formData.get("summary") ?? doc.summary);
  doc.termsText = String(formData.get("termsText") ?? doc.termsText);
  doc.notesText = String(formData.get("notesText") ?? doc.notesText);

  const total = Number(formData.get("total"));
  if (!Number.isNaN(total) && doc.lineItems[0]) {
    doc.total = total;
    doc.lineItems[0].amount = total;
    doc.lineItems[0].rate = doc.lineItems[0].qty ? total / doc.lineItems[0].qty : total;
  }

  revalidatePath(`/review/${id}`);
}
