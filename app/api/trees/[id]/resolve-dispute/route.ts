import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Tree } from "@/models";

const RESOLVABLE_STATUSES = [
  "REGISTERED",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "AVAILABLE",
  "SPONSORED",
  "MONITORING",
  "MATURE",
  "REJECTED",
  "DEAD",
  "REMOVED",
  "REPLACED",
] as const;

const bodySchema = z.object({
  newStatus: z.enum(RESOLVABLE_STATUSES),
});

// Mongo-only, unlike every other status route in this app: the deployed
// TreeRegistry has no on-chain path out of DISPUTED at all — isTransitionAllowed
// (12, x) is false for every x, and no contract in lib/web3/abis exposes a
// resolve/dispute function. So there is no transaction to confirm here; this
// just updates Tree.status. The contract's own record of this tree keeps
// showing DISPUTED until TreeRegistry is upgraded with a real resolution path.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin session required" },
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

    const updated = await Tree.findOneAndUpdate(
      { _id: id, status: "DISPUTED" },
      { status: parsed.data.newStatus },
      { new: true },
    );

    if (!updated) {
      const exists = await Tree.exists({ _id: id });
      return NextResponse.json(
        {
          success: false,
          error: exists ? "Tree is not currently disputed" : "Tree not found",
        },
        { status: exists ? 400 : 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("POST /api/trees/[id]/resolve-dispute error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve dispute" },
      { status: 500 },
    );
  }
}
