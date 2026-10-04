// @/app/operator/projects/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { OperatorRoleGate } from "@/components/operator/OperatorRoleGate";
import { useCreateProject } from "@/hooks/write/use-create-project";
import { getContractErrorMessage } from "@/lib/web3/errors";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function OperatorCreateProjectPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { createProject, isPending, isConfirming } = useCreateProject();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = isPending || isConfirming || isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!address) return;
    setError(null);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const slug = slugify(String(form.get("slug") || name));
    const metadataCID = String(form.get("metadataCID") ?? "");

    try {
      setIsSaving(true);
      const createRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: form.get("description"),
          country: form.get("country"),
          province: form.get("province"),
          regency: form.get("regency"),
          village: form.get("village"),
          latitude: Number(form.get("latitude")),
          longitude: Number(form.get("longitude")),
          areaHectares: Number(form.get("areaHectares")),
          targetTreeCount: Number(form.get("targetTreeCount")),
        }),
      });
      const createJson = await createRes.json();
      if (!createJson.success)
        throw new Error(createJson.error ?? "Failed to save project");
      setIsSaving(false);

      const projectId = createJson.data._id;
      let hash: `0x${string}`;
      try {
        hash = await createProject(slug, name, metadataCID, address);
      } catch (signError) {
        // Nothing reached the chain — a rejected or reverted signature means
        // no project exists there, so the draft must not survive either. It
        // would otherwise sit at "NOT ON-CHAIN" forever and block the slug on
        // the next attempt.
        await fetch(`/api/projects/${projectId}`, { method: "DELETE" }).catch(
          () => {},
        );
        throw signError;
      }

      setIsSaving(true);
      const linkRes = await fetch(`/api/projects/${projectId}/chain-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash }),
      });
      const linkJson = await linkRes.json();
      if (!linkJson.success)
        throw new Error(linkJson.error ?? "Failed to confirm on-chain");

      router.push("/operator/projects");
      router.refresh();
    } catch (err) {
      setError(getContractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        OPERATOR · NEW PROJECT
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Create Project
      </h1>
      <p className="mt-2 text-sm text-[#667069]">
        Saves the project in MongoDB, then registers it on TreeRegistry as the
        operator wallet you connect below.
      </p>

      <div className="mt-8">
        <OperatorRoleGate>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Project name" name="name" required />
            <Field
              label="Slug (on-chain code)"
              name="slug"
              placeholder="auto from name"
            />
            <Field label="Description" name="description" required textarea />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Country"
                name="country"
                defaultValue="Indonesia"
                required
              />
              <Field label="Province" name="province" required />
              <Field label="Regency" name="regency" required />
              <Field label="Village" name="village" required />
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
                label="Area (hectares)"
                name="areaHectares"
                type="number"
                step="any"
                required
              />
              <Field
                label="Target tree count"
                name="targetTreeCount"
                type="number"
                required
              />
            </div>
            <Field
              label="Metadata CID"
              name="metadataCID"
              placeholder="ipfs://... (plain string for now)"
              required
            />

            {error && <p className="text-sm text-[#B3402F]">{error}</p>}

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white transition hover:bg-[#163D2A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Confirm in wallet…"
                : isConfirming
                  ? "Waiting for confirmation…"
                  : isSaving
                    ? "Saving…"
                    : "Create Project"}
            </button>
          </form>
        </OperatorRoleGate>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  step,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
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
          defaultValue={defaultValue}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          step={step}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      )}
    </label>
  );
}
