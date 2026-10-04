import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User, Wallet } from "@/models";

const patchSchema = z.object({ isPrimary: z.literal(true) });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Sign in required" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    await connectDB();
    const wallet = await Wallet.findOne({ _id: id, userId: session.user.id });
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet not found" },
        { status: 404 },
      );
    }

    await Wallet.updateMany({ userId: session.user.id }, { isPrimary: false });
    wallet.isPrimary = true;
    await wallet.save();

    return NextResponse.json({ success: true, data: wallet }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/wallets/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update wallet" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Sign in required" },
        { status: 401 },
      );
    }

    const { id } = await params;
    await connectDB();

    const wallet = await Wallet.findOne({ _id: id, userId: session.user.id });
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet not found" },
        { status: 404 },
      );
    }

    // A wallet-first account has no usable password, so unlinking its last
    // wallet would lock the owner out of their own sponsorships permanently.
    const user = await User.findById(session.user.id);
    const remaining = await Wallet.countDocuments({ userId: session.user.id });
    if (remaining <= 1 && user?.placeholderEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This is your only way to sign in. Add an email and password first, then unlink this wallet.",
        },
        { status: 400 },
      );
    }

    const wasPrimary = wallet.isPrimary;
    await Wallet.deleteOne({ _id: wallet._id });

    // Promote the oldest remaining wallet so the account never ends up with
    // links but no primary.
    if (wasPrimary) {
      const next = await Wallet.findOne({ userId: session.user.id }).sort({
        createdAt: 1,
      });
      if (next) {
        next.isPrimary = true;
        await next.save();
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/wallets/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unlink wallet" },
      { status: 500 },
    );
  }
}
