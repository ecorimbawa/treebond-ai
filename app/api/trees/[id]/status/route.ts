import { type NextRequest, NextResponse } from "next/server";
import { parseEventLogs, TransactionReceiptNotFoundError } from "viem";
import { z } from "zod";
import { auth } from "@/auth";
import { CHAIN_ID, CONTRACTS } from "@/contracts/generated/addresses";
import { connectDB } from "@/lib/db/connection";
import { numberToTreeStatus } from "@/lib/tree-status";
import { TreeRegistryAbi } from "@/lib/web3/abis/TreeRegistry";
import { serverClient } from "@/lib/web3/server-client";
import { BlockchainTransaction, Tree } from "@/models";

const bodySchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

// Shared by both operator (e.g. -> PENDING_VERIFICATION) and verifier
// (e.g. -> VERIFIED) status transitions — the on-chain event is the only
// source of truth for what the new status actually is.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user.role !== "operator" && session.user.role !== "verifier")
    ) {
      return NextResponse.json(
        { success: false, error: "Operator or verifier session required" },
        { status: 401 },
      );
    }

    await connectDB();
    const { id } = await params;
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
    const { txHash } = parsed.data;

    const tree = await Tree.findById(id);
    if (!tree) {
      return NextResponse.json(
        { success: false, error: "Tree not found" },
        { status: 404 },
      );
    }
    if (tree.tokenId == null) {
      return NextResponse.json(
        { success: false, error: "Tree has not been registered on-chain yet" },
        { status: 400 },
      );
    }

    const existing = await BlockchainTransaction.findOne({
      txHash: txHash.toLowerCase(),
    });
    if (existing) {
      return NextResponse.json({ success: true, data: tree }, { status: 200 });
    }

    let receipt: Awaited<ReturnType<typeof serverClient.getTransactionReceipt>>;
    try {
      receipt = await serverClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });
    } catch (error) {
      if (error instanceof TransactionReceiptNotFoundError) {
        return NextResponse.json(
          {
            success: false,
            error: "Transaction not confirmed yet, try again shortly",
          },
          { status: 409 },
        );
      }
      throw error;
    }

    if (receipt.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Transaction reverted on-chain" },
        { status: 400 },
      );
    }
    if (receipt.to?.toLowerCase() !== CONTRACTS.treeRegistry.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction did not target the TreeRegistry contract",
        },
        { status: 400 },
      );
    }

    const [statusEvent] = parseEventLogs({
      abi: TreeRegistryAbi,
      eventName: "TreeStatusChanged",
      logs: receipt.logs,
    });
    if (!statusEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "No TreeStatusChanged event found in this transaction",
        },
        { status: 400 },
      );
    }
    if (statusEvent.args.treeId !== BigInt(tree.tokenId)) {
      return NextResponse.json(
        { success: false, error: "Transaction does not match this tree" },
        { status: 400 },
      );
    }

    const newStatus = numberToTreeStatus(statusEvent.args.status);
    const updated = await Tree.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true },
    );

    await BlockchainTransaction.create({
      txHash: txHash.toLowerCase(),
      chainId: CHAIN_ID,
      contractAddress: CONTRACTS.treeRegistry.toLowerCase(),
      functionName: "updateTreeStatus",
      fromAddress: receipt.from.toLowerCase(),
      toAddress: CONTRACTS.treeRegistry.toLowerCase(),
      blockNumber: Number(receipt.blockNumber),
      status: "success",
      gasUsed: receipt.gasUsed.toString(),
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("POST /api/trees/[id]/status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm status update" },
      { status: 500 },
    );
  }
}
