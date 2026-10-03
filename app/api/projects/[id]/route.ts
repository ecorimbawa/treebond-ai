import { type NextRequest, NextResponse } from "next/server";
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
