import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { treeRegistry } from "@/lib/web3/contracts";
import { getContractErrorMessage } from "@/lib/web3/errors";
import { OPERATOR_ROLE, VERIFIER_ROLE } from "@/lib/web3/roles";

export const runtime = "nodejs";

const ROLE_HASH = {
  OPERATOR_ROLE,
  VERIFIER_ROLE,
} as const;

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  role: z.enum(["OPERATOR_ROLE", "VERIFIER_ROLE"]),
});

// Bridges "promote this user to operator/verifier" (a Mongo-side decision)
// to the contract actually trusting their wallet — the two role systems stay
// separate; this is the one place that connects them, using the deployer-held
// DEFAULT_ADMIN_ROLE wallet (ADMIN_PRIVATE_KEY) to call grantRole on their behalf.
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin session required" },
        { status: 401 },
      );
    }

    await connectDB();
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
    const { walletAddress, role } = parsed.data;

    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: "ADMIN_PRIVATE_KEY is not configured on the server",
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
      ...treeRegistry,
      functionName: "grantRole",
      args: [ROLE_HASH[role], walletAddress as `0x${string}`],
    });

    return NextResponse.json(
      { success: true, data: { txHash: hash } },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/admin/grant-role error:", error);
    return NextResponse.json(
      { success: false, error: getContractErrorMessage(error) },
      { status: 500 },
    );
  }
}
