"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { KeyRound, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { useEnsureArbitrumSepolia, useHasOperatorRole } from "@/hooks";

const CARD = "rounded-2xl border border-[#e2e7e2] bg-white p-6";

/**
 * Everything an operator write needs to be true *before* the form is usable:
 * a wallet, the right chain, and OPERATOR_ROLE on TreeRegistry.
 *
 * That last check is the point. Without it the form looked perfectly healthy,
 * wrote a draft to Mongo, and only then asked the wallet to sign — where the
 * contract rejected it with AccessControlUnauthorizedAccount. The operator saw
 * a cryptic revert after their data was already saved, and was left with a
 * project stuck at "NOT ON-CHAIN". Checking first means nothing is written
 * until the transaction can actually succeed.
 */
export function OperatorRoleGate({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { wrongChain, switchToArbitrumSepolia, isSwitching } =
    useEnsureArbitrumSepolia();
  const hasOperatorRole = useHasOperatorRole(address);

  if (!isConnected) {
    return (
      <div className={CARD}>
        <p className="text-sm font-extrabold text-[#163D2A]">
          Connect your operator wallet
        </p>
        <p className="mt-1 text-sm leading-6 text-[#667069]">
          Registering on TreeRegistry is signed by your own wallet, so it has to
          be connected before you start.
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
          TreeRegistry only exists on Arbitrum Sepolia.
        </p>
        <button
          type="button"
          onClick={switchToArbitrumSepolia}
          disabled={isSwitching}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white transition hover:bg-[#163D2A] disabled:opacity-60"
        >
          {isSwitching ? "Switching…" : "Switch to Arbitrum Sepolia"}
        </button>
      </div>
    );
  }

  if (!hasOperatorRole) {
    return (
      <div className={CARD}>
        <span className="grid size-10 place-items-center rounded-xl bg-[#FBEFD9] text-[#B7791F]">
          <KeyRound size={18} aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm font-extrabold text-[#163D2A]">
          This wallet has no OPERATOR_ROLE
        </p>
        <p className="mt-1 text-sm leading-6 text-[#667069]">
          Being an operator in the app is not the same as being one on-chain.
          TreeRegistry would reject this transaction with{" "}
          <code>AccessControlUnauthorizedAccount</code>, so the form stays
          locked until the role is granted.
        </p>
        <p className="mt-4 rounded-xl bg-[#F3F5F1] px-4 py-3 text-sm leading-6 text-[#667069]">
          Ask an admin to grant <code>OPERATOR_ROLE</code> to{" "}
          <span className="break-all font-[family-name:var(--font-geist-mono)] text-xs text-[#163D2A]">
            {address}
          </span>{" "}
          from the Grant Role form on <code>/admin</code>, then reload.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
