"use client";

import { type FormEvent, useState } from "react";

export function GrantRoleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/grant-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: form.get("walletAddress"),
          role: form.get("role"),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to grant role");
      setResult(json.data.txHash);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant role");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e2e7e2] bg-white p-6"
    >
      <label className="block text-sm" htmlFor="walletAddress">
        <span className="font-bold text-[#163D2A]">Wallet address</span>
        <input
          id="walletAddress"
          name="walletAddress"
          placeholder="0x..."
          required
          pattern="^0x[a-fA-F0-9]{40}$"
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      </label>
      <label className="mt-4 block text-sm" htmlFor="role">
        <span className="font-bold text-[#163D2A]">Role (on TreeRegistry)</span>
        <select
          id="role"
          name="role"
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        >
          <option value="OPERATOR_ROLE">OPERATOR_ROLE</option>
          <option value="VERIFIER_ROLE">VERIFIER_ROLE</option>
        </select>
      </label>

      {error && <p className="mt-3 text-sm text-[#B3402F]">{error}</p>}
      {result && (
        <p className="mt-3 break-all text-sm text-[#246B45]">
          Granted — tx {result}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Granting…" : "Grant Role"}
      </button>
    </form>
  );
}
