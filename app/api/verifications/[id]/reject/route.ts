import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { AiAnalysis, TreeEvidence, Verification } from "@/models";

const bodySchema = z.object({
  reason: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "verifier") {
      return NextResponse.json(
        { success: false, error: "Verifier session required" },
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

    const evidence = await TreeEvidence.findById(id);
    if (!evidence) {
      return NextResponse.json(
        { success: false, error: "Evidence not found" },
        { status: 404 },
      );
    }
    if (evidence.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Evidence has already been reviewed" },
        { status: 400 },
      );
    }

    const aiAnalysis = await AiAnalysis.findOne({ evidenceId: evidence._id });
    if (!aiAnalysis) {
      return NextResponse.json(
        { success: false, error: "No AI analysis found for this evidence" },
        { status: 400 },
      );
    }

    const verification = await Verification.create({
      treeId: evidence.treeId,
      evidenceId: evidence._id,
      aiAnalysisId: aiAnalysis._id,
      verifierId: session.user.id,
      status: "REJECTED",
      verificationScore: Math.round(
        (aiAnalysis.healthScore + aiAnalysis.growthScore) / 2,
      ),
      decision: "rejected",
      reason: parsed.data.reason,
    });

    evidence.status = "rejected";
    await evidence.save();

    return NextResponse.json(
      { success: true, data: verification },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/verifications/[id]/reject error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject verification" },
      { status: 500 },
    );
  }
}
