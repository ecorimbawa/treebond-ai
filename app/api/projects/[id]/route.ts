import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Project, Tree } from "@/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const trees = await Tree.find({ projectId: id }).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: { project, trees } },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

/**
 * Discards a draft project that never made it on-chain.
 *
 * The create flow writes to Mongo before asking the wallet to sign, so a
 * rejected or reverted signature used to strand a project reading "NOT
 * ON-CHAIN" forever, with no way to remove or retry it from any screen. The
 * form now calls this when the signing step fails.
 *
 * Deliberately narrow: an operator can only discard their own project, only
 * while it has no on-chain id, and only while it has no trees — anything
 * already on-chain is a permanent record that deleting the Mongo row would
 * merely hide.
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

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }
    if (project.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "That project belongs to another operator" },
        { status: 403 },
      );
    }
    if (project.onChainProjectId != null) {
      return NextResponse.json(
        {
          success: false,
          error: "This project is already on-chain and cannot be discarded",
        },
        { status: 400 },
      );
    }

    const treeCount = await Tree.countDocuments({ projectId: project._id });
    if (treeCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `This project still has ${treeCount} tree(s) attached`,
        },
        { status: 400 },
      );
    }

    await Project.deleteOne({ _id: project._id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to discard project" },
      { status: 500 },
    );
  }
}
