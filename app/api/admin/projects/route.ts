import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Project, User } from "@/models";

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

    const projects = await Project.find()
      .populate("createdBy", "fullName email")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments();

    return NextResponse.json(
      {
        success: true,
        data: projects,
        pagination: { total, limit, skip, hasMore: skip + limit < total },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  country: z.string().min(1),
  province: z.string().min(1),
  regency: z.string().min(1),
  village: z.string().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  areaHectares: z.coerce.number().positive(),
  targetTreeCount: z.coerce.number().int().positive(),
  createdBy: z.string().min(1),
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

    const operator = await User.findById(parsed.data.createdBy);
    if (!operator || operator.role !== "operator") {
      return NextResponse.json(
        { success: false, error: "createdBy must be an existing operator" },
        { status: 400 },
      );
    }

    const existingSlug = await Project.findOne({
      slug: parsed.data.slug.toLowerCase(),
    });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "A project with this slug already exists" },
        { status: 409 },
      );
    }

    const project = await Project.create({
      ...parsed.data,
      slug: parsed.data.slug.toLowerCase(),
      status: "active",
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 },
    );
  }
}
