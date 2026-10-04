import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

// Creates a Mongo-only draft, same as the operator's own registration form —
// still needs a real registerTree() on-chain call afterward before it has a
// tokenId. Admin just picks which existing project it belongs to.
const createSchema = z.object({
  projectId: z.string().min(1),
  treeCode: z.string().min(1),
  species: z.string().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  plantedAt: z.coerce.date(),
  initialHeightCm: z.coerce.number().nonnegative(),
  currentHeightCm: z.coerce.number().nonnegative(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin session required" },
        { status: 401 },
      );
    }

    await connectDB();
    const parsed = createSchema.safeParse(await request.json());
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

    const project = await Project.findById(parsed.data.projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const existingCode = await Tree.findOne({ treeCode: parsed.data.treeCode });
    if (existingCode) {
      return NextResponse.json(
        { success: false, error: "A tree with this code already exists" },
        { status: 409 },
      );
    }

    const tree = await Tree.create({ ...parsed.data, status: "DRAFT" });

    return NextResponse.json({ success: true, data: tree }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/trees error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create tree" },
      { status: 500 },
    );
  }
}
