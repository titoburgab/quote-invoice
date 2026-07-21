"use client";

import { useState } from "react";
import type { Client } from "@/lib/mock-data";

type Props = {
  clients: Client[];
  action: (formData: FormData) => void;
};

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";
const labelClass = "block text-sm font-medium text-ink-soft";

function Segmented<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-surface p-1">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              className={`block cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-ink text-bg" : "text-ink-soft"
              }`}
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-paper-line pt-6 first:border-t-0 first:pt-0">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function NewDocumentForm({ clients, action }: Props) {
  const [type, setType] = useState<"quote" | "invoice">("quote");
  const [clientMode, setClientMode] = useState<"existing" | "new">(
    clients.length > 0 ? "existing" : "new",
  );
  const [rateType, setRateType] = useState<"hourly" | "fixed">("hourly");

  return (
    <form
      action={action}
      className="flex flex-col gap-8 rounded-lg border border-paper-line bg-paper p-8 text-paper-ink shadow-sm"
    >
      <Segmented
        name="type"
        value={type}
        onChange={setType}
        options={[
          { value: "quote", label: "Quote" },
          { value: "invoice", label: "Invoice" },
        ]}
      />

      <Section title="Client">
        {clients.length > 0 && (
          <Segmented
            name="clientMode"
            value={clientMode}
            onChange={setClientMode}
            options={[
              { value: "existing", label: "Existing client" },
              { value: "new", label: "New client" },
            ]}
          />
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
      </Section>

      <Section title="Project">
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
      </Section>

      <Section title="Rate">
        <Segmented
          name="rateType"
          value={rateType}
          onChange={setRateType}
          options={[
            { value: "hourly", label: "Hourly" },
            { value: "fixed", label: "Fixed price" },
          ]}
        />
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
        </div>
      </Section>

      {type === "quote" ? (
        <Section title="Quote terms">
          <div>
            <label className={labelClass} htmlFor="validUntil">
              Valid until
            </label>
            <input id="validUntil" name="validUntil" type="date" className={inputClass} />
          </div>
        </Section>
      ) : (
        <Section title="Invoice terms">
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
            <div>
              <label className={labelClass} htmlFor="linkedQuoteId">
                Linked quote ID (optional)
              </label>
              <input id="linkedQuoteId" name="linkedQuoteId" className={inputClass} />
            </div>
          </div>
        </Section>
      )}

      <button
        type="submit"
        className="self-start rounded-md bg-paper-ink px-6 py-3 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5 hover:shadow-md"
      >
        Draft {type}
      </button>
    </form>
  );
}
