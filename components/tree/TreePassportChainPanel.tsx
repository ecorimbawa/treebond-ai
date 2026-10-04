"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useEnsureArbitrumSepolia } from "@/hooks";
import { useLatestVerification } from "@/hooks/read/use-latest-verification";
import { useTree } from "@/hooks/read/use-tree";
import { useTreeOwner } from "@/hooks/read/use-tree-owner";
import { useTreePrice } from "@/hooks/read/use-tree-price";
import { useSponsorTree } from "@/hooks/write/use-sponsor-tree";
import {
  numberToTreeStatus,
  TREE_STATUS,
  TREE_STATUS_LABEL,
} from "@/lib/tree-status";
import { getContractErrorMessage } from "@/lib/web3/errors";
import { formatEth, formatTimestamp } from "@/lib/web3/format";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-sm text-[#929A94]">{label}</dt>
      <dd className="text-sm font-bold text-[#163D2A]">{value}</dd>
    </div>
  );
}

export function TreePassportChainPanel({
  mongoTreeId,
  tokenId,
}: {
  mongoTreeId: string;
  tokenId: number | null;
}) {
  const { isConnected } = useAccount();
  const { wrongChain, switchToArbitrumSepolia, isSwitching } =
    useEnsureArbitrumSepolia();

  if (tokenId === null) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d9e2da] bg-white p-6 text-sm text-[#667069]">
        This tree has not been registered on-chain yet.
      </div>
    );
  }

  return (
    <OnChainDetails
      mongoTreeId={mongoTreeId}
      tokenId={BigInt(tokenId)}
      isConnected={isConnected}
      wrongChain={wrongChain}
      switchToArbitrumSepolia={switchToArbitrumSepolia}
      isSwitching={isSwitching}
    />
  );
}

function OnChainDetails({
  mongoTreeId,
  tokenId,
  isConnected,
  wrongChain,
  switchToArbitrumSepolia,
  isSwitching,
}: {
  mongoTreeId: string;
  tokenId: bigint;
  isConnected: boolean;
  wrongChain: boolean;
  switchToArbitrumSepolia: () => void;
  isSwitching: boolean;
}) {
  const router = useRouter();
  const {
    tree,
    isLoading: treeLoading,
    refetch: refetchTree,
  } = useTree(tokenId);
  const { price, isLoading: priceLoading } = useTreePrice(tokenId);
  const { owner, isLoading: ownerLoading } = useTreeOwner(tokenId);
  const { verification, notFound: noVerification } =
    useLatestVerification(tokenId);
  const { sponsorTree, isPending, isConfirming } = useSponsorTree();
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSponsoredTxHash, setJustSponsoredTxHash] = useState<string | null>(
    null,
  );

  if (treeLoading || priceLoading) {
    return (
      <div className="rounded-2xl border border-[#e2e7e2] bg-white p-6 text-sm text-[#929A94]">
        Reading on-chain record…
      </div>
    );
  }

  const onChainStatus = tree ? numberToTreeStatus(tree.status) : null;
  const isAvailable = tree?.status === TREE_STATUS.AVAILABLE;
  const isBusy = isPending || isConfirming || isSyncing;

  async function handleSponsor() {
    setError(null);
    try {
      const hash = await sponsorTree(tokenId, price);
      setIsSyncing(true);
      const res = await fetch(`/api/trees/${mongoTreeId}/sponsor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error ?? "Failed to sync sponsorship");
      setJustSponsoredTxHash(hash);
      await refetchTree();
      router.refresh();
    } catch (err) {
      setError(getContractErrorMessage(err));
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div>
      {justSponsoredTxHash && (
        <div className="mb-4 rounded-2xl border border-[#DDEEE3] bg-[#F4FAF6] p-5">
          <p className="font-extrabold text-[#246B45]">
            ✓ You now own this Tree RWA
          </p>
          <p className="mt-1 text-sm text-[#667069]">
            Track its growth anytime from{" "}
            <Link href="/dashboard" className="font-bold underline">
              your dashboard
            </Link>
            .
          </p>
          <a
            href={`https://sepolia.arbiscan.io/tx/${justSponsoredTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-bold text-[#246B45] underline"
          >
            View transaction
          </a>
        </div>
      )}
      <div className="rounded-2xl border border-[#e2e7e2] bg-white p-6">
        <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
          BLOCKCHAIN — ARBITRUM SEPOLIA
        </p>
        <dl className="mt-3 divide-y divide-[#f1f3f1]">
          <Row label="Token ID" value={`#${tokenId.toString()}`} />
          <Row
            label="On-chain status"
            value={onChainStatus ? TREE_STATUS_LABEL[onChainStatus] : "—"}
          />
          <Row label="Price" value={formatEth(price)} />
          <Row
            label="Owner"
            value={
              ownerLoading
                ? "…"
                : owner
                  ? `${owner.slice(0, 6)}…${owner.slice(-4)}`
                  : "Not sponsored yet"
            }
          />
          <Row
            label="Latest verification"
            value={
              noVerification || !verification
                ? "None yet"
                : `Health ${verification.healthScore} · Growth ${verification.growthScore}`
            }
          />
          {verification && !noVerification && (
            <Row
              label="Verified at"
              value={formatTimestamp(verification.timestamp)}
            />
          )}
        </dl>

        <div className="mt-6 border-t border-[#e2e7e2] pt-6">
          {!isConnected ? (
            <ConnectButton />
          ) : wrongChain ? (
            <button
              type="button"
              onClick={switchToArbitrumSepolia}
              disabled={isSwitching}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#B3402F] px-4 text-sm font-bold text-white transition hover:bg-[#8f3225] disabled:opacity-60"
            >
              {isSwitching ? "Switching…" : "Switch to Arbitrum Sepolia"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSponsor}
              disabled={!isAvailable || isBusy}
              title={
                isAvailable
                  ? undefined
                  : "This tree is not AVAILABLE for sponsorship right now."
              }
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white transition hover:bg-[#163D2A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending
                ? "Confirm in wallet…"
                : isConfirming
                  ? "Waiting for confirmation…"
                  : isSyncing
                    ? "Syncing…"
                    : isAvailable
                      ? `Sponsor for ${formatEth(price)}`
                      : "Not available for sponsorship"}
            </button>
          )}
          {error && <p className="mt-3 text-sm text-[#B3402F]">{error}</p>}
        </div>
      </div>
    </div>
  );
}
