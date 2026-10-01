import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Tree } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const status = searchParams.get("status");
    const species = searchParams.get("species");
    const projectId = searchParams.get("projectId");

    // Build filter
    const filter: Record<string, string> = {};
    if (status) filter.status = status;
    if (species) filter.species = species;
    if (projectId) filter.projectId = projectId;

    const trees = await Tree.find(filter)
      .limit(limit)
      .skip(skip)
      .populate("projectId")
      .sort({ createdAt: -1 });

    const total = await Tree.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: trees,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/trees error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trees",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const tree = new Tree({
      projectId: body.projectId,
      treeCode: body.treeCode,
      species: body.species,
      latitude: body.latitude,
      longitude: body.longitude,
      plantedAt: body.plantedAt,
      initialHeightCm: body.initialHeightCm,
      currentHeightCm: body.currentHeightCm,
      status: "DRAFT",
    });

    await tree.save();

    return NextResponse.json(
      {
        success: true,
        data: tree,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/trees error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create tree",
      },
      { status: 500 },
    );
  }
}
