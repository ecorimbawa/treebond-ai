import { type NextRequest, NextResponse } from "next/server";
import { parseEventLogs, TransactionReceiptNotFoundError } from "viem";
import { z } from "zod";
import { CHAIN_ID, CONTRACTS } from "@/contracts/generated/addresses";
import { connectDB } from "@/lib/db/connection";
import { TreeBondAbi } from "@/lib/web3/abis/TreeBond";
import { serverClient } from "@/lib/web3/server-client";
import { BlockchainTransaction, Tree } from "@/models";

const bodySchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

// Confirm-then-verify: never trust the client's claim about what a tx did.
// Independently re-read the chain and only then write MongoDB.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
        {
          success: false,
          error: "Tree has not been registered on-chain yet",
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
    if (receipt.to?.toLowerCase() !== CONTRACTS.treeBond.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction did not target the TreeBond contract",
        },
        { status: 400 },
      );
    }

    const [sponsoredEvent] = parseEventLogs({
      abi: TreeBondAbi,
      eventName: "TreeSponsored",
      logs: receipt.logs,
    });
    if (!sponsoredEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "No TreeSponsored event found in this transaction",
        },
        { status: 400 },
      );
    }
    if (sponsoredEvent.args.treeId !== BigInt(tree.tokenId)) {
      return NextResponse.json(
        { success: false, error: "Transaction does not match this tree" },
        { status: 400 },
      );
    }

    const sponsor = sponsoredEvent.args.sponsor;
    const updated = await Tree.findByIdAndUpdate(
      id,
      {
        status: "SPONSORED",
        ownerWallet: sponsor.toLowerCase(),
        contractAddress: CONTRACTS.treeNFT.toLowerCase(),
      },
      { new: true },
    );

    await BlockchainTransaction.create({
      txHash: txHash.toLowerCase(),
      chainId: CHAIN_ID,
      contractAddress: CONTRACTS.treeBond.toLowerCase(),
      functionName: "sponsorTree",
      fromAddress: receipt.from.toLowerCase(),
      toAddress: CONTRACTS.treeBond.toLowerCase(),
      blockNumber: Number(receipt.blockNumber),
      status: "success",
      gasUsed: receipt.gasUsed.toString(),
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("POST /api/trees/[id]/sponsor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm sponsorship" },
      { status: 500 },
    );
  }
}
