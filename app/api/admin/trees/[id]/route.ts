import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { AiAnalysis, Tree, TreeEvidence, Verification } from "@/models";

// Deliberately excludes status, tokenId, contractAddress, ownerWallet — all
// chain-derived and only ever written by the confirm-then-verify routes
// (sponsor, register-chain, status, resolve-dispute). Editing them here
// directly would desync Mongo from whatever the chain actually says.
const updateSchema = z.object({
  species: z.string().min(1).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  plantedAt: z.coerce.date().optional(),
  initialHeightCm: z.coerce.number().nonnegative().optional(),
  currentHeightCm: z.coerce.number().nonnegative().optional(),
});

export async function PATCH(
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
    const parsed = updateSchema.safeParse(await request.json());
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

    const updated = await Tree.findByIdAndUpdate(id, parsed.data, {
      new: true,
    }).populate("projectId", "name");
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Tree not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/trees/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update tree" },
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
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin session required" },
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
    if (tree.tokenId != null) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete: this tree is already registered on-chain. Deleting it here would leave a token with no Mongo record.",
        },
        { status: 400 },
      );
    }

    const evidenceIds = (
      await TreeEvidence.find({ treeId: id }).select("_id")
    ).map((e) => e._id);

    await Promise.all([
      AiAnalysis.deleteMany({ evidenceId: { $in: evidenceIds } }),
      Verification.deleteMany({ treeId: id }),
      TreeEvidence.deleteMany({ treeId: id }),
      Tree.findByIdAndDelete(id),
    ]);

    return NextResponse.json(
      { success: true, data: { _id: id } },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/admin/trees/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete tree" },
      { status: 500 },
    );
  }
}
