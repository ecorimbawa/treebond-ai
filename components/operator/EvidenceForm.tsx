"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const EVIDENCE_TYPES = [
  "INITIAL_PLANTING",
  "MONITORING",
  "HEALTH_CHECK",
  "GROWTH_CHECK",
  "GPS_CHECK",
  "DEATH_REPORT",
  "REPLACEMENT",
] as const;

export function EvidenceForm({ mongoTreeId }: { mongoTreeId: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch(`/api/trees/${mongoTreeId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.get("type"),
          imageCid: form.get("imageCid"),
          latitude: form.get("latitude"),
          longitude: form.get("longitude"),
          capturedAt: new Date(String(form.get("capturedAt"))).toISOString(),
          healthScore: form.get("healthScore"),
          growthScore: form.get("growthScore"),
          anomalyRiskScore: form.get("anomalyRiskScore"),
          explanation: form.get("explanation"),
        }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error ?? "Failed to save evidence");
      router.push(`/trees/${mongoTreeId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save evidence");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Select label="Evidence type" name="type" options={EVIDENCE_TYPES} />
      <Field
        label="Image CID"
        name="imageCid"
        placeholder="ipfs://... (plain string for now)"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Latitude"
          name="latitude"
          type="number"
          step="any"
          required
        />
        <Field
          label="Longitude"
          name="longitude"
          type="number"
          step="any"
          required
        />
        <Field
          label="Captured at"
          name="capturedAt"
          type="datetime-local"
          required
        />
      </div>

      <p className="pt-2 text-xs font-extrabold tracking-[0.14em] text-[#667069]">
        AI ANALYSIS (MANUAL ENTRY)
      </p>
      <div className="grid grid-cols-3 gap-4">
        <Field
          label="Health score"
          name="healthScore"
          type="number"
          min={0}
          max={100}
          required
        />
        <Field
          label="Growth score"
          name="growthScore"
          type="number"
          min={0}
          max={100}
          required
        />
        <Field
          label="Anomaly risk"
          name="anomalyRiskScore"
          type="number"
          min={0}
          max={100}
          required
        />
      </div>
      <Field label="Explanation" name="explanation" textarea required />

      {error && <p className="text-sm text-[#B3402F]">{error}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white transition hover:bg-[#163D2A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Submit Evidence"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  min,
  max,
  step,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block text-sm" htmlFor={name}>
      <span className="font-bold text-[#163D2A]">{label}</span>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          min={min}
          max={max}
          step={step}
          required={required}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      )}
    </label>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly string[];
}) {
  return (
    <label className="block text-sm" htmlFor={name}>
      <span className="font-bold text-[#163D2A]">{label}</span>
      <select
        id={name}
        name={name}
        className="mt-1.5 w-full rounded-xl border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
