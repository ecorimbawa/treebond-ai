"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import type { VerificationStatus } from "@/models/Verification";

type VerificationSummary = {
  id: string;
  status: VerificationStatus;
  reason: string;
  txHash?: string;
} | null;

export function VerificationActions({
  evidenceId,
  verification,
}: {
  evidenceId: string;
  verification: VerificationSummary;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "approve" | "reject", reason: string) {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/verifications/${evidenceId}/${decision}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error ?? "Failed to save decision");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save decision");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!verification) {
    return (
      <DecisionForm
        isSubmitting={isSubmitting}
        error={error}
        onApprove={(reason) => decide("approve", reason)}
        onReject={(reason) => decide("reject", reason)}
      />
    );
  }

  if (verification.status === "REJECTED") {
    return (
      <div className="rounded-2xl border border-[#F7E1DE] bg-[#FBF2F0] p-5 text-sm text-[#B3402F]">
        Rejected: {verification.reason}
      </div>
    );
  }

  if (verification.status === "ON_CHAIN") {
    return (
      <div className="rounded-2xl border border-[#DDEEE3] bg-[#F4FAF6] p-5 text-sm text-[#246B45]">
        <p className="font-extrabold">Submitted on-chain</p>
        {verification.txHash && (
          <a
            href={`https://sepolia.arbiscan.io/tx/${verification.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block underline"
          >
            View transaction
          </a>
        )}
      </div>
    );
  }

  // status === "APPROVED" — decided, not yet on-chain
  return (
    <SubmitToChainForm
      verificationId={verification.id}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={async (verifierAddress) => {
        setError(null);
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/oracle/submit-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              verificationId: verification.id,
              verifierAddress,
            }),
          });
          const json = await res.json();
          if (!json.success)
            throw new Error(json.error ?? "Failed to submit on-chain");
          router.refresh();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to submit on-chain",
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
    />
  );
}

function DecisionForm({
  isSubmitting,
  error,
  onApprove,
  onReject,
}: {
  isSubmitting: boolean;
  error: string | null;
  onApprove: (reason: string) => void;
  onReject: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="rounded-2xl border border-[#e2e7e2] bg-white p-6">
      <label className="block text-sm" htmlFor="reason">
        <span className="font-bold text-[#163D2A]">Reason</span>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          required
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      </label>
      {error && <p className="mt-3 text-sm text-[#B3402F]">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={isSubmitting || !reason}
          onClick={() => onApprove(reason)}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={isSubmitting || !reason}
          onClick={() => onReject(reason)}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#B3402F] px-4 text-sm font-bold text-[#B3402F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function SubmitToChainForm({
  isSubmitting,
  error,
  onSubmit,
}: {
  verificationId: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (verifierAddress: string) => void;
}) {
  const { address } = useAccount();
  const [verifierAddress, setVerifierAddress] = useState(address ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(verifierAddress);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e2e7e2] bg-white p-6"
    >
      <p className="text-sm text-[#667069]">
        Approved. The oracle wallet will sign and submit this to
        VerificationRegistry — credited to the verifier address below.
      </p>
      <label className="mt-4 block text-sm" htmlFor="verifierAddress">
        <span className="font-bold text-[#163D2A]">
          Verifier wallet address
        </span>
        <input
          id="verifierAddress"
          value={verifierAddress}
          onChange={(e) => setVerifierAddress(e.target.value)}
          placeholder="0x..."
          required
          pattern="^0x[a-fA-F0-9]{40}$"
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      </label>
      {error && <p className="mt-3 text-sm text-[#B3402F]">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Submit to Blockchain"}
      </button>
    </form>
  );
}
