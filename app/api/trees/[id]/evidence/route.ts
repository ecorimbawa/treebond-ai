import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { AiAnalysis, Tree, TreeEvidence } from "@/models";

const bodySchema = z.object({
  type: z.enum([
    "INITIAL_PLANTING",
    "MONITORING",
    "HEALTH_CHECK",
    "GROWTH_CHECK",
    "DEATH_REPORT",
    "REPLACEMENT",
    "GPS_CHECK",
  ]),
  imageCid: z.string().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  capturedAt: z.string().min(1),
  healthScore: z.coerce.number().int().min(0).max(100),
  growthScore: z.coerce.number().int().min(0).max(100),
  anomalyRiskScore: z.coerce.number().int().min(0).max(100),
  explanation: z.string().min(1),
});

function anomalyBucket(score: number): "LOW" | "MEDIUM" | "HIGH" {
  if (score < 34) return "LOW";
  if (score < 67) return "MEDIUM";
  return "HIGH";
}

// No real IPFS/AI pipeline here (out of scope for this pass) — imageCid and
// the AI scores are plain manually-entered values, consistent with how
// metadataCID is treated elsewhere. This exists so the verifier queue
// (Verification requires evidenceId + aiAnalysisId) has something to review.
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

    const tree = await Tree.findById(id);
    if (!tree) {
      return NextResponse.json(
        { success: false, error: "Tree not found" },
        { status: 404 },
      );
    }

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
    const input = parsed.data;

    const evidence = await TreeEvidence.create({
      treeId: tree._id,
      type: input.type,
      imageCid: input.imageCid,
      latitude: input.latitude,
      longitude: input.longitude,
      capturedAt: input.capturedAt,
      submittedBy: session.user.id,
      status: "pending",
    });

    const aiAnalysis = await AiAnalysis.create({
      evidenceId: evidence._id,
      treeDetected: true,
      treeConfidence: 1,
      healthScore: input.healthScore,
      growthScore: input.growthScore,
      anomalyRisk: anomalyBucket(input.anomalyRiskScore),
      anomalyRiskScore: input.anomalyRiskScore,
      diseaseDetected: false,
      explanation: input.explanation,
      modelName: "manual-entry",
      modelVersion: "v0",
    });

    return NextResponse.json(
      { success: true, data: { evidence, aiAnalysis } },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/trees/[id]/evidence error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save evidence" },
      { status: 500 },
    );
  }
}
