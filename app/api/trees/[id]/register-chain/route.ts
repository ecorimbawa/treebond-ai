import { type NextRequest, NextResponse } from "next/server";
import { parseEventLogs, TransactionReceiptNotFoundError } from "viem";
import { z } from "zod";
import { auth } from "@/auth";
import { CHAIN_ID, CONTRACTS } from "@/contracts/generated/addresses";
import { connectDB } from "@/lib/db/connection";
import { TreeRegistryAbi } from "@/lib/web3/abis/TreeRegistry";
import { serverClient } from "@/lib/web3/server-client";
import { BlockchainTransaction, Project, Tree } from "@/models";

const bodySchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

// A txHash can only ever decode to the one treeId that specific registerTree()
// call produced, so the only cross-check needed is that the event's projectId
// matches this tree's project — confirming the tx landed on the right project.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "operator") {
      return NextResponse.json(
        { success: false, error: "Operator session required" },
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

    const project = await Project.findById(tree.projectId);
    if (!project?.onChainProjectId) {
      return NextResponse.json(
        {
          success: false,
          error: "This tree's project has not been confirmed on-chain yet",
        },
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

    const [registeredEvent] = parseEventLogs({
      abi: TreeRegistryAbi,
      eventName: "TreeRegistered",
      logs: receipt.logs,
    });
    if (!registeredEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "No TreeRegistered event found in this transaction",
        },
        { status: 400 },
      );
    }
    if (registeredEvent.args.projectId !== BigInt(project.onChainProjectId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction does not match this tree's project",
        },
        { status: 400 },
      );
    }

    const updated = await Tree.findByIdAndUpdate(
      id,
      {
        status: "REGISTERED",
        tokenId: Number(registeredEvent.args.treeId),
      },
      { new: true },
    );

    await BlockchainTransaction.create({
      txHash: txHash.toLowerCase(),
      chainId: CHAIN_ID,
      contractAddress: CONTRACTS.treeRegistry.toLowerCase(),
      functionName: "registerTree",
      fromAddress: receipt.from.toLowerCase(),
      toAddress: CONTRACTS.treeRegistry.toLowerCase(),
      blockNumber: Number(receipt.blockNumber),
      status: "success",
      gasUsed: receipt.gasUsed.toString(),
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("POST /api/trees/[id]/register-chain error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm on-chain registration" },
      { status: 500 },
    );
  }
}
