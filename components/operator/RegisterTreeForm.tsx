"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { OperatorRoleGate } from "@/components/operator/OperatorRoleGate";
import { useRegisterTree } from "@/hooks/write/use-register-tree";
import { getContractErrorMessage } from "@/lib/web3/errors";
import { toMicrodegrees } from "@/lib/web3/format";

export function RegisterTreeForm({
  mongoProjectId,
  onChainProjectId,
}: {
  mongoProjectId: string;
  onChainProjectId: number;
}) {
  const router = useRouter();
  const { registerTree, isPending, isConfirming } = useRegisterTree();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = isPending || isConfirming || isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const treeCode = String(form.get("treeCode") ?? "");
    const species = String(form.get("species") ?? "");
    const latitude = Number(form.get("latitude"));
    const longitude = Number(form.get("longitude"));
    const plantedAt = String(form.get("plantedAt") ?? "");
    const initialHeightCm = Number(form.get("initialHeightCm"));
    const metadataCID = String(form.get("metadataCID") ?? "");
    const plantedAtSeconds = BigInt(
      Math.floor(new Date(plantedAt).getTime() / 1000),
    );

    try {
      setIsSaving(true);
      const createRes = await fetch("/api/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: mongoProjectId,
          treeCode,
          species,
          latitude,
          longitude,
          plantedAt,
          initialHeightCm,
          currentHeightCm: initialHeightCm,
        }),
      });
      const createJson = await createRes.json();
      if (!createJson.success)
        throw new Error(createJson.error ?? "Failed to save tree");
      setIsSaving(false);

      const treeId = createJson.data._id;
      let hash: `0x${string}`;
      try {
        hash = await registerTree(
          BigInt(onChainProjectId),
          treeCode,
          metadataCID,
          toMicrodegrees(latitude),
          toMicrodegrees(longitude),
          plantedAtSeconds,
        );
      } catch (signError) {
        // Nothing reached the chain, so the Mongo draft must not survive —
        // otherwise it sits at DRAFT with no tokenId and holds the treeCode
        // hostage on the next attempt.
        await fetch(`/api/trees/${treeId}`, { method: "DELETE" }).catch(
          () => {},
        );
        throw signError;
      }

      setIsSaving(true);
      const registerRes = await fetch(`/api/trees/${treeId}/register-chain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash }),
      });
      const registerJson = await registerRes.json();
      if (!registerJson.success)
        throw new Error(registerJson.error ?? "Failed to confirm on-chain");

      router.push(`/trees/${treeId}`);
      router.refresh();
    } catch (err) {
      setError(getContractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-8">
      <OperatorRoleGate>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Tree code"
            name="treeCode"
            placeholder="TREE-JTG-000192"
            required
          />
          <Field label="Species" name="species" required />
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
            <Field label="Planted at" name="plantedAt" type="date" required />
            <Field
              label="Initial height (cm)"
              name="initialHeightCm"
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
                  : "Register Tree"}
          </button>
        </form>
      </OperatorRoleGate>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block text-sm" htmlFor={name}>
      <span className="font-bold text-[#163D2A]">{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
      />
    </label>
  );
}
