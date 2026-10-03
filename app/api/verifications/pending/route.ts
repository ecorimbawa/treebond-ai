import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { TreeEvidence } from "@/models";

// The review queue is pending TreeEvidence, not Verification docs — a
// Verification record only gets created once a verifier actually decides
// (see /api/verifications/[id]/approve|reject), since its schema requires a
// `decision` up front.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "verifier") {
      return NextResponse.json(
        { success: false, error: "Verifier session required" },
        { status: 401 },
      );
    }

    await connectDB();
    const pending = await TreeEvidence.find({ status: "pending" })
      .populate("treeId")
      .sort({ capturedAt: -1 });

    return NextResponse.json({ success: true, data: pending }, { status: 200 });
  } catch (error) {
    console.error("GET /api/verifications/pending error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending verifications" },
      { status: 500 },
    );
  }
}
