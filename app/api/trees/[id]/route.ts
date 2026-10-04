import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Tree, TreeEvidence, Verification } from "@/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const tree = await Tree.findById(id).populate("projectId");

    if (!tree) {
      return NextResponse.json(
        {
          success: false,
          error: "Tree not found",
        },
        { status: 404 },
      );
    }

    // Get evidence history
    const evidence = await TreeEvidence.find({ treeId: id })
      .populate("submittedBy", "email fullName")
      .sort({ capturedAt: -1 });

    // Get verifications
    const verifications = await Verification.find({ treeId: id })
      .populate("verifierId", "email fullName")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: {
          tree,
          evidence,
          verifications,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/trees/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tree",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const tree = await Tree.findByIdAndUpdate(id, body, { new: true }).populate(
      "projectId",
    );

    if (!tree) {
      return NextResponse.json(
        {
          success: false,
          error: "Tree not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: tree,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/trees/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update tree",
      },
      { status: 500 },
    );
  }
}

/**
 * Discards a draft tree that never made it on-chain — the registration form's
 * rollback when the wallet signature fails. Mirrors the project version: own
 * project only, no tokenId, and nothing already recorded against it.
 */
export async function DELETE(
  _request: NextRequest,
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

    const tree = await Tree.findById(id).populate("projectId");
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
          error: "This tree is already on-chain and cannot be discarded",
        },
        { status: 400 },
      );
    }

    const project = tree.projectId as unknown as {
      createdBy?: { toString(): string };
    } | null;
    if (project?.createdBy?.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "That tree belongs to another operator" },
        { status: 403 },
      );
    }

    const [evidenceCount, verificationCount] = await Promise.all([
      TreeEvidence.countDocuments({ treeId: tree._id }),
      Verification.countDocuments({ treeId: tree._id }),
    ]);
    if (evidenceCount > 0 || verificationCount > 0) {
      return NextResponse.json(
        { success: false, error: "This tree already has monitoring records" },
        { status: 400 },
      );
    }

    await Tree.deleteOne({ _id: tree._id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/trees/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to discard tree" },
      { status: 500 },
    );
  }
}
