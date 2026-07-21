"use client";

import { useState } from "react";
import type { Client } from "@/lib/mock-data";

type Props = {
  clients: Client[];
  action: (formData: FormData) => void;
};

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function NewDocumentForm({ clients, action }: Props) {
  const [type, setType] = useState<"quote" | "invoice">("quote");
  const [clientMode, setClientMode] = useState<"existing" | "new">(
    clients.length > 0 ? "existing" : "new",
  );
  const [rateType, setRateType] = useState<"hourly" | "fixed">("hourly");

  return (
    <form action={action} className="flex flex-col gap-8">
      <fieldset className="flex gap-4">
        <legend className={labelClass}>Document type</legend>
        {(["quote", "invoice"] as const).map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm capitalize">
            <input
              type="radio"
              name="type"
              value={option}
              checked={type === option}
              onChange={() => setType(option)}
            />
            {option}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Client</h2>

        {clients.length > 0 && (
          <fieldset className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="clientMode"
                value="existing"
                checked={clientMode === "existing"}
                onChange={() => setClientMode("existing")}
              />
              Existing client
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="clientMode"
                value="new"
                checked={clientMode === "new"}
                onChange={() => setClientMode("new")}
              />
              New client
            </label>
          </fieldset>
        )}

        {clientMode === "existing" && clients.length > 0 ? (
          <div>
            <label className={labelClass} htmlFor="existingClientId">
              Select client
            </label>
            <select id="existingClientId" name="existingClientId" className={inputClass} required>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""} — {c.email}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="clientName">
                Name
              </label>
              <input id="clientName" name="clientName" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="clientEmail">
                Email
              </label>
              <input id="clientEmail" name="clientEmail" type="email" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="clientCompany">
                Company
              </label>
              <input id="clientCompany" name="clientCompany" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="clientPhone">
                Phone
              </label>
              <input id="clientPhone" name="clientPhone" className={inputClass} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Project</h2>
        <div>
          <label className={labelClass} htmlFor="projectTitle">
            Project title
          </label>
          <input id="projectTitle" name="projectTitle" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="description">
            Description
          </label>
          <textarea id="description" name="description" rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="notes">
            Notes
          </label>
          <textarea id="notes" name="notes" rows={2} className={inputClass} />
        </div>
      </div>

      {type === "quote" ? (
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Quote details</h2>
          <fieldset className="flex gap-4">
            <legend className={labelClass}>Rate type</legend>
            {(["hourly", "fixed"] as const).map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm capitalize">
                <input
                  type="radio"
                  name="rateType"
                  value={option}
                  checked={rateType === option}
                  onChange={() => setRateType(option)}
                />
                {option}
              </label>
            ))}
          </fieldset>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rateType === "hourly" && (
              <div>
                <label className={labelClass} htmlFor="estimatedHours">
                  Estimated hours
                </label>
                <input
                  id="estimatedHours"
                  name="estimatedHours"
                  type="number"
                  min={0}
                  step="0.5"
                  className={inputClass}
                  required
                />
              </div>
            )}
            <div>
              <label className={labelClass} htmlFor="rate">
                {rateType === "hourly" ? "Rate ($/hr)" : "Fixed price ($)"}
              </label>
              <input id="rate" name="rate" type="number" min={0} step="0.01" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="validUntil">
                Valid until
              </label>
              <input id="validUntil" name="validUntil" type="date" className={inputClass} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Invoice details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="billingPeriod">
                Billing period
              </label>
              <input
                id="billingPeriod"
                name="billingPeriod"
                placeholder="e.g. July 2026"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="rate">
                Amount to bill ($)
              </label>
              <input id="rate" name="rate" type="number" min={0} step="0.01" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="paymentTerms">
                Payment terms
              </label>
              <input id="paymentTerms" name="paymentTerms" placeholder="e.g. Net 15" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="dueDate">
                Due date
              </label>
              <input id="dueDate" name="dueDate" type="date" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="linkedQuoteId">
                Linked quote ID (optional)
              </label>
              <input id="linkedQuoteId" name="linkedQuoteId" className={inputClass} />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="self-start rounded-full bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Generate draft
      </button>
    </form>
  );
}
