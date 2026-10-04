"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Plus, Star, Trash2, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createSiweMessage } from "viem/siwe";
import { useAccount, useSignMessage } from "wagmi";
import {
  buttonClass,
  Callout,
  ConsoleMain,
  cellClass,
  ErrorBanner,
  mono,
  PageHeader,
  Pill,
  rowClass,
  Table,
  TableCard,
  TableEmpty,
  TableSkeleton,
  Th,
  Thead,
} from "@/components/console/ui";
import { CHAIN_ID } from "@/contracts/generated/addresses";
import { SIWE_STATEMENT } from "@/lib/siwe-statements";

type LinkedWallet = {
  _id: string;
  address: string;
  chainId: number;
  isPrimary: boolean;
  verifiedAt: string | null;
  createdAt: string;
};

const COLUMNS = 4;

export function WalletManager() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();
  const [wallets, setWallets] = useState<LinkedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/wallets");
    const json = await res.json();
    if (json.success) setWallets(json.data);
    else setError(json.error ?? "Failed to load wallets");
  }, []);

  useEffect(() => {
    load().finally(() => setIsLoading(false));
  }, [load]);

  const connectedIsLinked =
    address != null &&
    wallets.some((w) => w.address.toLowerCase() === address.toLowerCase());

  async function handleLink() {
    setError(null);
    setNotice(null);

    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }

    setIsLinking(true);
    try {
      const nonceRes = await fetch("/api/auth/siwe/nonce");
      const nonceJson = await nonceRes.json();
      if (!nonceJson.success) throw new Error("Could not start wallet linking");

      const message = createSiweMessage({
        address,
        chainId: CHAIN_ID,
        domain: window.location.host,
        nonce: nonceJson.data.nonce,
        uri: window.location.origin,
        version: "1",
        statement: SIWE_STATEMENT.link,
      });

      const signature = await signMessageAsync({ message });

      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to link wallet");

      await load();
      setNotice(
        "Wallet linked — any tree it already sponsors now shows in your portfolio.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to link wallet";
      if (!/rejected|denied/i.test(message)) setError(message);
    } finally {
      setIsLinking(false);
    }
  }

  async function handleSetPrimary(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/wallets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPendingId(null);
    }
  }

  async function handleUnlink(id: string) {
    if (
      !confirm(
        "Unlink this wallet? Trees it sponsored will drop out of your portfolio until you link it again.",
      )
    )
      return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/wallets/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to unlink");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlink");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <ConsoleMain>
      <PageHeader
        eyebrow="SPONSOR · WALLETS"
        title="Wallets linked to your account"
        description="Your portfolio is the sum of every tree sponsored by these addresses. Link more than one if you sponsor from several wallets."
      />

      <div className="mt-8 max-w-3xl">
        <Callout
          tone="muted"
          icon={<Wallet size={16} aria-hidden="true" />}
          title="Linking costs nothing"
        >
          You sign a plain message to prove the wallet is yours — no
          transaction, no gas, and TreeBond never gets permission to move
          anything.
        </Callout>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      )}
      {notice && (
        <p className="mt-6 rounded-xl border border-[#cfe2d4] bg-[#eff7f1] px-4 py-3 text-sm font-semibold text-[#246B45]">
          {notice}
        </p>
      )}

      <div className="mt-8">
        <TableCard
          title="Linked wallets"
          meta={
            isLoading
              ? "Loading…"
              : `${wallets.length} address${wallets.length === 1 ? "" : "es"} verified`
          }
          actions={
            <button
              type="button"
              onClick={handleLink}
              disabled={isLinking || connectedIsLinked}
              title={
                connectedIsLinked
                  ? "The connected wallet is already linked"
                  : undefined
              }
              className={buttonClass("primary", "sm")}
            >
              <Plus size={14} aria-hidden="true" />
              {isLinking
                ? "Check your wallet…"
                : !isConnected
                  ? "Connect a Wallet"
                  : connectedIsLinked
                    ? "Already linked"
                    : "Link Connected Wallet"}
            </button>
          }
        >
          <Table>
            <Thead>
              <Th>Address</Th>
              <Th>Network</Th>
              <Th>Linked</Th>
              <Th align="right" srOnly>
                Actions
              </Th>
            </Thead>
            {isLoading ? (
              <TableSkeleton columns={COLUMNS} rows={2} />
            ) : (
              <tbody className="divide-y divide-[#e2e7e2]">
                {wallets.length === 0 ? (
                  <TableEmpty
                    colSpan={COLUMNS}
                    icon={<Wallet size={20} aria-hidden="true" />}
                    title="No wallets linked"
                    hint="Link the wallet you sponsor with to see your trees here."
                  />
                ) : (
                  wallets.map((wallet) => {
                    const isConnectedOne =
                      address?.toLowerCase() === wallet.address.toLowerCase();
                    return (
                      <tr key={wallet._id} className={rowClass}>
                        <td className="px-5 py-4 align-middle">
                          <p
                            className={`${mono} break-all text-sm font-semibold text-[#163D2A]`}
                          >
                            {wallet.address}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {wallet.isPrimary && (
                              <Pill tone="good">PRIMARY</Pill>
                            )}
                            {isConnectedOne && (
                              <Pill tone="chain">CONNECTED NOW</Pill>
                            )}
                          </div>
                        </td>
                        <td className={cellClass}>Arbitrum Sepolia</td>
                        <td className={cellClass}>
                          {new Date(wallet.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right align-middle">
                          <div className="flex justify-end gap-2">
                            {!wallet.isPrimary && (
                              <button
                                type="button"
                                disabled={pendingId === wallet._id}
                                onClick={() => handleSetPrimary(wallet._id)}
                                className={buttonClass("secondary", "sm")}
                              >
                                <Star size={13} aria-hidden="true" />
                                Make primary
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={pendingId === wallet._id}
                              onClick={() => handleUnlink(wallet._id)}
                              aria-label={`Unlink ${wallet.address}`}
                              className={buttonClass("danger", "sm")}
                            >
                              <Trash2 size={13} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </Table>
        </TableCard>
      </div>
    </ConsoleMain>
  );
}
