import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Project, Tree } from "@/models";

// Deliberately excludes createdBy and onChainProjectId — the first is a
// relationship (not a free-text field), the second is chain-derived and
// only ever written by the confirm-then-verify chain-link route.
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  province: z.string().min(1).optional(),
  regency: z.string().min(1).optional(),
  village: z.string().min(1).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  areaHectares: z.coerce.number().positive().optional(),
  targetTreeCount: z.coerce.number().int().positive().optional(),
  status: z.enum(["active", "paused", "completed", "archived"]).optional(),
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

    const updated = await Project.findByIdAndUpdate(id, parsed.data, {
      new: true,
    }).populate("createdBy", "fullName email");
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
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

    const treeCount = await Tree.countDocuments({ projectId: id });
    if (treeCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete: this project has ${treeCount} tree(s). Remove those first.`,
        },
        { status: 400 },
      );
    }

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: { _id: id } },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/admin/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
