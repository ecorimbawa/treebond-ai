import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { z } from "zod";
import { auth } from "@/auth";
import { CHAIN_ID, CONTRACTS } from "@/contracts/generated/addresses";
import { connectDB } from "@/lib/db/connection";
import { verificationRegistry } from "@/lib/web3/contracts";
import { getContractErrorMessage } from "@/lib/web3/errors";
import { serverClient } from "@/lib/web3/server-client";
import {
  AiAnalysis,
  BlockchainTransaction,
  Tree,
  TreeEvidence,
  Verification,
} from "@/models";

export const runtime = "nodejs";

const bodySchema = z.object({
  verificationId: z.string().min(1),
  verifierAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

// Canonical evidence: field order/shape must stay stable, since
// evidenceHash = keccak256(JSON.stringify(this)).
function buildCanonicalEvidence(input: {
  tokenId: number;
  evidenceCID: string;
  capturedAt: Date;
  latitude: number;
  longitude: number;
  aiAnalysisId: string;
}) {
  return {
    treeId: String(input.tokenId),
    evidenceCID: input.evidenceCID,
    capturedAt: input.capturedAt.toISOString(),
    latitude: input.latitude,
    longitude: input.longitude,
    aiAnalysisId: input.aiAnalysisId,
    verificationVersion: 1,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "verifier") {
      return NextResponse.json(
        { success: false, error: "Verifier session required" },
        { status: 401 },
      );
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }
    const { verificationId, verifierAddress } = parsed.data;

    await connectDB();
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      return NextResponse.json(
        { success: false, error: "Verification not found" },
        { status: 404 },
      );
    }
    if (verification.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "Only approved verifications can be submitted on-chain",
        },
        { status: 400 },
      );
    }

    const [tree, evidence, aiAnalysis] = await Promise.all([
      Tree.findById(verification.treeId),
      TreeEvidence.findById(verification.evidenceId),
      AiAnalysis.findById(verification.aiAnalysisId),
    ]);
    if (!tree?.tokenId || !evidence || !aiAnalysis) {
      return NextResponse.json(
        { success: false, error: "Tree is not registered on-chain yet" },
        { status: 400 },
      );
    }

    const canonical = buildCanonicalEvidence({
      tokenId: tree.tokenId,
      evidenceCID: evidence.imageCid,
      capturedAt: evidence.capturedAt,
      latitude: evidence.latitude,
      longitude: evidence.longitude,
      aiAnalysisId: aiAnalysis._id.toString(),
    });
    const evidenceHash = keccak256(toHex(JSON.stringify(canonical)));

    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: "ORACLE_PRIVATE_KEY is not configured on the server",
        },
        { status: 500 },
      );
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const wallet = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });

    const hash = await wallet.writeContract({
      ...verificationRegistry,
      functionName: "submitVerification",
      args: [
        BigInt(tree.tokenId),
        aiAnalysis.healthScore,
        aiAnalysis.growthScore,
        aiAnalysis.anomalyRiskScore,
        evidenceHash,
        evidence.imageCid,
        verifierAddress as `0x${string}`,
      ],
    });

    const receipt = await serverClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Oracle transaction reverted on-chain" },
        { status: 500 },
      );
    }

    verification.status = "ON_CHAIN";
    verification.txHash = hash;
    verification.blockNumber = Number(receipt.blockNumber);
    verification.onChainTimestamp = new Date();
    await verification.save();

    await BlockchainTransaction.create({
      txHash: hash.toLowerCase(),
      chainId: CHAIN_ID,
      contractAddress: CONTRACTS.verificationRegistry.toLowerCase(),
      functionName: "submitVerification",
      fromAddress: account.address.toLowerCase(),
      toAddress: CONTRACTS.verificationRegistry.toLowerCase(),
      blockNumber: Number(receipt.blockNumber),
      status: "success",
      gasUsed: receipt.gasUsed.toString(),
    });

    return NextResponse.json(
      { success: true, data: verification },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/oracle/submit-verification error:", error);
    return NextResponse.json(
      { success: false, error: getContractErrorMessage(error) },
      { status: 500 },
    );
  }
}
