"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { type FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { useEnsureArbitrumSepolia } from "@/hooks";
import { useGrantRole } from "@/hooks/write/use-grant-role";
import { useRevokeRole } from "@/hooks/write/use-revoke-role";
import { getContractErrorMessage } from "@/lib/web3/errors";
import { OPERATOR_ROLE, VERIFIER_ROLE } from "@/lib/web3/roles";

const ROLE_HASH = { OPERATOR_ROLE, VERIFIER_ROLE } as const;

// Signed by whichever wallet the admin connects here, not a server-held key
// — same client-side pattern as sponsor/operator writes. Only works if that
// wallet already holds DEFAULT_ADMIN_ROLE on TreeRegistry; otherwise the
// transaction reverts with AccessControlUnauthorizedAccount. Grant and Revoke
// share the same wallet-address + role inputs since they're the same
// contract call shape in opposite directions.
export function GrantRoleForm() {
  const { isConnected } = useAccount();
  const { wrongChain, switchToArbitrumSepolia, isSwitching } =
    useEnsureArbitrumSepolia();
  const {
    grantRole,
    isPending: isGrantPending,
    isConfirming: isGrantConfirming,
  } = useGrantRole();
  const {
    revokeRole,
    isPending: isRevokePending,
    isConfirming: isRevokeConfirming,
  } = useRevokeRole();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isGrantBusy = isGrantPending || isGrantConfirming;
  const isRevokeBusy = isRevokePending || isRevokeConfirming;
  const isBusy = isGrantBusy || isRevokeBusy;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const walletAddress = String(form.get("walletAddress") ?? "");
    const role = String(form.get("role") ?? "OPERATOR_ROLE") as
      | "OPERATOR_ROLE"
      | "VERIFIER_ROLE";
    const action = String(form.get("action") ?? "grant") as "grant" | "revoke";

    try {
      const hash =
        action === "grant"
          ? await grantRole(ROLE_HASH[role], walletAddress as `0x${string}`)
          : await revokeRole(ROLE_HASH[role], walletAddress as `0x${string}`);
      setResult(`${action === "grant" ? "Granted" : "Revoked"} — tx ${hash}`);
      event.currentTarget.reset();
    } catch (err) {
      setError(getContractErrorMessage(err));
    }
  }

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-[#e2e7e2] bg-white p-6">
        <p className="mb-4 text-sm text-[#667069]">
          Connect the wallet that holds <code>DEFAULT_ADMIN_ROLE</code> to grant
          or revoke roles.
        </p>
        <ConnectButton />
      </div>
    );
  }

  if (wrongChain) {
    return (
      <button
        type="button"
        onClick={switchToArbitrumSepolia}
        disabled={isSwitching}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#B3402F] px-4 text-sm font-bold text-white disabled:opacity-60"
      >
        {isSwitching ? "Switching…" : "Switch to Arbitrum Sepolia"}
      </button>
    );
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
        <p className="mt-3 break-all text-sm text-[#246B45]">{result}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          name="action"
          value="grant"
          disabled={isBusy}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGrantPending
            ? "Confirm in wallet…"
            : isGrantConfirming
              ? "Waiting…"
              : "Grant Role"}
        </button>
        <button
          type="submit"
          name="action"
          value="revoke"
          disabled={isBusy}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#B3402F] px-4 text-sm font-bold text-[#B3402F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRevokePending
            ? "Confirm in wallet…"
            : isRevokeConfirming
              ? "Waiting…"
              : "Revoke Role"}
        </button>
      </div>
    </form>
  );
}
