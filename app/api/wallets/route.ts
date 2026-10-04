import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { CHAIN_ID } from "@/contracts/generated/addresses";
import { connectDB } from "@/lib/db/connection";
import { verifySignIn } from "@/lib/siwe";
import { Wallet } from "@/models";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Sign in required" },
        { status: 401 },
      );
    }

    await connectDB();
    const wallets = await Wallet.find({ userId: session.user.id }).sort({
      isPrimary: -1,
      createdAt: 1,
    });

    return NextResponse.json({ success: true, data: wallets }, { status: 200 });
  } catch (error) {
    console.error("GET /api/wallets error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load wallets" },
      { status: 500 },
    );
  }
}

const linkSchema = z.object({
  message: z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

// Linking requires the same SIWE proof as signing in — an address is only
// attached to an account by whoever can sign for it, never by typing it in.
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Sign in required" },
        { status: 401 },
      );
    }

    const parsed = linkSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    const result = await verifySignIn(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    await connectDB();
    const address = result.address.toLowerCase();

    const existing = await Wallet.findOne({ address });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            existing.userId.toString() === session.user.id
              ? "That wallet is already linked to this account"
              : "That wallet is already linked to a different account",
        },
        { status: 409 },
      );
    }

    // First wallet on an account becomes primary so there's always exactly one
    // default to attribute a sponsorship to.
    const walletCount = await Wallet.countDocuments({
      userId: session.user.id,
    });
    const wallet = await Wallet.create({
      userId: session.user.id,
      address,
      chainId: CHAIN_ID,
      isPrimary: walletCount === 0,
      verifiedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: wallet }, { status: 201 });
  } catch (error) {
    console.error("POST /api/wallets error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to link wallet" },
      { status: 500 },
    );
  }
}
