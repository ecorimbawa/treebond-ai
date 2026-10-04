"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useHasOperatorRole } from "@/hooks/read/use-has-role";
import { useTree } from "@/hooks/read/use-tree";
import { useUpdateTreeStatus } from "@/hooks/write/use-update-tree-status";
import {
  numberToTreeStatus,
  TREE_STATUS,
  TREE_STATUS_LABEL,
  type TreeStatusNumber,
} from "@/lib/tree-status";
import { getContractErrorMessage } from "@/lib/web3/errors";

const PATH_TO_AVAILABLE: TreeStatusNumber[] = [
  TREE_STATUS.PENDING_VERIFICATION,
  TREE_STATUS.VERIFIED,
  TREE_STATUS.AVAILABLE,
];

// Operator-only actions for this tree, gated purely by whether the connected
// wallet holds OPERATOR_ROLE (not by MongoDB session) — invisible to
// sponsors/visitors. Lives on the public Tree Passport because that's the
// only page an operator reliably lands on for a specific tree (register-tree
// redirects here), and neither /operator/projects nor this page previously
// linked onward to evidence upload — this panel is the fix for both gaps.
export function OperatorToolsPanel({
  mongoTreeId,
  tokenId,
}: {
  mongoTreeId: string;
  tokenId: number;
}) {
  const { address } = useAccount();
  const isOperator = useHasOperatorRole(address);
  const { tree, refetch } = useTree(BigInt(tokenId));
  const { updateTreeStatus, isPending, isConfirming } = useUpdateTreeStatus();
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOperator || !tree) return null;

  const currentStatus = tree.status as TreeStatusNumber;
  const remainingSteps = PATH_TO_AVAILABLE.filter((s) => s > currentStatus);

  async function handleAdvance() {
    setError(null);
    setIsRunning(true);
    try {
      for (let i = 0; i < remainingSteps.length; i++) {
        setStep(i + 1);
        const hash = await updateTreeStatus(BigInt(tokenId), remainingSteps[i]);
        const res = await fetch(`/api/trees/${mongoTreeId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: hash }),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error ?? "Failed to sync status");
        }
      }
      await refetch();
    } catch (err) {
      setError(getContractErrorMessage(err));
    } finally {
      setIsRunning(false);
      setStep(0);
    }
  }

  return (
    <div className="mb-4 rounded-2xl border border-dashed border-[#D9A441] bg-[#FFFBF0] p-5">
      <p className="text-xs font-extrabold tracking-[0.14em] text-[#B7791F]">
        OPERATOR TOOLS
      </p>
      <p className="mt-2 text-sm text-[#667069]">
        Currently{" "}
        <strong className="text-[#163D2A]">
          {TREE_STATUS_LABEL[numberToTreeStatus(currentStatus)]}
        </strong>{" "}
        on-chain.
      </p>

      {error && <p className="mt-2 text-sm text-[#B3402F]">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {remainingSteps.length > 0 && (
          <button
            type="button"
            onClick={handleAdvance}
            disabled={isRunning || isPending || isConfirming}
            className="inline-flex h-10 items-center rounded-xl bg-[#B7791F] px-4 text-sm font-bold text-white transition hover:bg-[#8f611a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning
              ? `Advancing… (step ${step}/${remainingSteps.length}, confirm each in your wallet)`
              : `Advance to Available (${remainingSteps.length} step${remainingSteps.length > 1 ? "s" : ""})`}
          </button>
        )}
        <Link
          href={`/operator/trees/${mongoTreeId}/evidence/new`}
          className="inline-flex h-10 items-center rounded-xl border border-[#D9A441] px-4 text-sm font-bold text-[#B7791F] transition hover:bg-[#FBEFD9]"
        >
          Upload Monitoring Evidence
        </Link>
      </div>
    </div>
  );
}
