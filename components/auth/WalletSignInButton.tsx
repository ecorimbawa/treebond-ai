"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { createSiweMessage } from "viem/siwe";
import { useAccount, useSignMessage } from "wagmi";
import { CHAIN_ID } from "@/contracts/generated/addresses";
import { SIWE_STATEMENT } from "@/lib/siwe-statements";

const HOME_BY_ROLE: Record<string, string> = {
  operator: "/operator/projects",
  verifier: "/verifier",
  admin: "/admin",
};

/**
 * One button that covers both sign-in and sign-up: an address nobody has
 * claimed becomes a sponsor account server-side (see auth.ts's `siwe`
 * provider), so there is no separate "register with wallet" path to get out
 * of sync with this one.
 */
export function WalletSignInButton({
  label = "Continue with Wallet",
  callbackUrl,
}: {
  label?: string;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }

    setIsBusy(true);
    try {
      const nonceRes = await fetch("/api/auth/siwe/nonce");
      const nonceJson = await nonceRes.json();
      if (!nonceJson.success) throw new Error("Could not start sign-in");

      const message = createSiweMessage({
        address,
        chainId: CHAIN_ID,
        domain: window.location.host,
        nonce: nonceJson.data.nonce,
        uri: window.location.origin,
        version: "1",
        statement: SIWE_STATEMENT.signIn,
      });

      const signature = await signMessageAsync({ message });

      const result = await signIn("siwe", {
        message,
        signature,
        redirect: false,
      });
      if (result?.error) {
        throw new Error("That signature was not accepted. Please try again.");
      }

      const session = await getSession();
      const role = session?.user?.role;
      router.push(callbackUrl || (role && HOME_BY_ROLE[role]) || "/dashboard");
      router.refresh();
    } catch (err) {
      // Wallet rejections are a normal choice, not a failure worth shouting
      // about — everything else gets surfaced.
      const message =
        err instanceof Error ? err.message : "Wallet sign-in failed";
      setError(/rejected|denied|User rejected/i.test(message) ? null : message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d9e2da] bg-white text-sm font-bold text-[#163D2A] transition duration-200 hover:border-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Image
          src="/metamask-fox.svg"
          alt=""
          width={16}
          height={16}
          aria-hidden="true"
        />
        {isBusy ? "Check your wallet…" : isConnected ? label : "Connect Wallet"}
      </button>
      {isConnected && address && !isBusy && (
        <p className="mt-2 text-center text-[11px] text-[#929A94]">
          {address.slice(0, 6)}…{address.slice(-4)} · you&rsquo;ll be asked to
          sign a message, not a transaction
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-[#F7E1DE] px-3 py-2 text-center text-xs font-semibold text-[#B3402F]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
