import { type NextRequest, NextResponse } from "next/server";
import { parseEventLogs, TransactionReceiptNotFoundError } from "viem";
import { z } from "zod";
import { auth } from "@/auth";
import { CHAIN_ID, CONTRACTS } from "@/contracts/generated/addresses";
import { connectDB } from "@/lib/db/connection";
import { TreeRegistryAbi } from "@/lib/web3/abis/TreeRegistry";
import { getReceiptWithRetry } from "@/lib/web3/receipt";
import { BlockchainTransaction, Project } from "@/models";

const bodySchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

// Confirm-then-verify: the on-chain `code` argument passed to createProject()
// must equal this project's Mongo `slug` — that's the natural key tying the
// decoded event back to the right Mongo document.
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

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const existing = await BlockchainTransaction.findOne({
      txHash: txHash.toLowerCase(),
    });
    if (existing) {
      return NextResponse.json(
        { success: true, data: project },
        { status: 200 },
      );
    }

    let receipt: Awaited<ReturnType<typeof getReceiptWithRetry>>;
    try {
      receipt = await getReceiptWithRetry(txHash as `0x${string}`);
    } catch (error) {
      if (error instanceof TransactionReceiptNotFoundError) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Transaction is not visible on our node yet. It may still land — retry in a moment before creating this again.",
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

    const [createdEvent] = parseEventLogs({
      abi: TreeRegistryAbi,
      eventName: "ProjectCreated",
      logs: receipt.logs,
    });
    if (!createdEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "No ProjectCreated event found in this transaction",
        },
        { status: 400 },
      );
    }
    if (createdEvent.args.code !== project.slug) {
      return NextResponse.json(
        { success: false, error: "Transaction does not match this project" },
        { status: 400 },
      );
    }

    const updated = await Project.findByIdAndUpdate(
      id,
      { onChainProjectId: Number(createdEvent.args.projectId) },
      { new: true },
    );

    await BlockchainTransaction.create({
      txHash: txHash.toLowerCase(),
      chainId: CHAIN_ID,
      contractAddress: CONTRACTS.treeRegistry.toLowerCase(),
      functionName: "createProject",
      fromAddress: receipt.from.toLowerCase(),
      toAddress: CONTRACTS.treeRegistry.toLowerCase(),
      blockNumber: Number(receipt.blockNumber),
      status: "success",
      gasUsed: receipt.gasUsed.toString(),
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("POST /api/projects/[id]/chain-link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm on-chain project" },
      { status: 500 },
    );
  }
}
