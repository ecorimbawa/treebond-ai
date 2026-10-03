import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Project } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const status = searchParams.get("status");
    const createdBy = searchParams.get("createdBy");

    const filter: Record<string, string> = {};
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;

    const projects = await Project.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: projects,
        pagination: { total, limit, skip, hasMore: skip + limit < total },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "operator") {
      return NextResponse.json(
        { success: false, error: "Operator session required" },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await request.json();

    const project = new Project({
      name: body.name,
      slug: body.slug,
      description: body.description,
      country: body.country,
      province: body.province,
      regency: body.regency,
      village: body.village,
      latitude: body.latitude,
      longitude: body.longitude,
      areaHectares: body.areaHectares,
      targetTreeCount: body.targetTreeCount,
      createdBy: session.user.id,
      status: "active",
    });

    await project.save();

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 },
    );
  }
}
