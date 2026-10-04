import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Project, Tree } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin session required" },
        { status: 401 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");
    const operatorId = searchParams.get("operatorId");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    // Tree has no operator field of its own — "operator" is Project.createdBy,
    // so this filter resolves to a set of projectIds first. Combined with an
    // explicit projectId, the two must intersect (not just both apply
    // independently), otherwise "this operator" + "that project" could
    // silently return another operator's trees for that project.
    if (operatorId) {
      const ownedProjects = await Project.find({
        createdBy: operatorId,
      }).select("_id");
      const ownedIds = ownedProjects.map((p) => p._id.toString());
      filter.projectId = {
        $in: projectId ? ownedIds.filter((id) => id === projectId) : ownedIds,
      };
    } else if (projectId) {
      filter.projectId = projectId;
    }

    const trees = await Tree.find(filter)
      .populate({
        path: "projectId",
        select: "name createdBy",
        populate: { path: "createdBy", select: "fullName email" },
      })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Tree.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: trees,
        pagination: { total, limit, skip, hasMore: skip + limit < total },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/trees error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trees" },
      { status: 500 },
    );
  }
}
