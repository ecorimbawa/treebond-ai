import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import {
  BlockchainTransaction,
  Project,
  Tree,
  User,
  Verification,
} from "@/models";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin session required" },
        { status: 401 },
      );
    }

    await connectDB();

    const [
      userCount,
      projectCount,
      treeCount,
      sponsoredCount,
      verificationCount,
      onChainVerificationCount,
      txCount,
      failedTxCount,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Tree.countDocuments(),
      Tree.countDocuments({ status: "SPONSORED" }),
      Verification.countDocuments(),
      Verification.countDocuments({ status: "ON_CHAIN" }),
      BlockchainTransaction.countDocuments(),
      BlockchainTransaction.countDocuments({ status: "failed" }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          userCount,
          projectCount,
          treeCount,
          sponsoredCount,
          verificationCount,
          onChainVerificationCount,
          txCount,
          failedTxCount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}
