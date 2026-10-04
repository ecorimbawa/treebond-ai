"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { KeyRound, TriangleAlert, Wallet } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { buttonClass, Field, mono, SelectField } from "@/components/admin/ui";
import { useEnsureArbitrumSepolia } from "@/hooks";
import { useGrantRole } from "@/hooks/write/use-grant-role";
import { useRevokeRole } from "@/hooks/write/use-revoke-role";
import { getContractErrorMessage } from "@/lib/web3/errors";
import { OPERATOR_ROLE, VERIFIER_ROLE } from "@/lib/web3/roles";

const ROLE_HASH = { OPERATOR_ROLE, VERIFIER_ROLE } as const;

// White card on the dashboard's dark panel, same treatment as the landing
// page's Tree Passport card — this form is the visual anchor of that section.
const CARD =
  "rounded-2xl border border-white/20 bg-white p-6 shadow-[0_20px_50px_rgba(22,61,42,.18)]";

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
      <div className={CARD}>
        <span className="grid size-10 place-items-center rounded-xl bg-[#F3F5F1] text-[#246B45]">
          <Wallet size={18} aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm font-extrabold text-[#163D2A]">
          Wallet not connected
        </p>
        <p className="mt-1 text-sm leading-6 text-[#667069]">
          Connect the wallet that holds <code>DEFAULT_ADMIN_ROLE</code> to grant
          or revoke roles.
        </p>
        <div className="mt-5">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (wrongChain) {
    return (
      <div className={CARD}>
        <span className="grid size-10 place-items-center rounded-xl bg-[#F7E1DE] text-[#B3402F]">
          <TriangleAlert size={18} aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm font-extrabold text-[#163D2A]">
          Wrong network
        </p>
        <p className="mt-1 text-sm leading-6 text-[#667069]">
          TreeRegistry only exists on Arbitrum Sepolia. Switch networks before
          signing anything.
        </p>
        <button
          type="button"
          onClick={switchToArbitrumSepolia}
          disabled={isSwitching}
          className={`mt-5 w-full ${buttonClass("primary")}`}
        >
          {isSwitching ? "Switching…" : "Switch to Arbitrum Sepolia"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={CARD}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#DDEEE3] text-[#246B45]">
          <KeyRound size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-[#163D2A]">
            Grant or revoke
          </p>
          <p className="text-[11px] text-[#929A94]">
            Signed from your connected wallet
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <Field
          label="Wallet address"
          name="walletAddress"
          placeholder="0x..."
          required
          pattern="^0x[a-fA-F0-9]{40}$"
          hint="42 characters, including the 0x prefix"
        />
        <SelectField label="Role (on TreeRegistry)" name="role">
          <option value="OPERATOR_ROLE">OPERATOR_ROLE</option>
          <option value="VERIFIER_ROLE">VERIFIER_ROLE</option>
        </SelectField>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-[#F7E1DE] px-3 py-2 text-sm font-semibold text-[#B3402F]"
        >
          {error}
        </p>
      )}
      {result && (
        <p
          className={`${mono} mt-4 break-all rounded-xl bg-[#DDEEE3] px-3 py-2 text-xs leading-5 text-[#246B45]`}
        >
          {result}
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          name="action"
          value="grant"
          disabled={isBusy}
          className={`flex-1 ${buttonClass("primary")}`}
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
          className={`flex-1 ${buttonClass("danger")}`}
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
