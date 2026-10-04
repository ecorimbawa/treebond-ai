import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Tree } from "@/models";

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

    const filter = { status: "DISPUTED" };

    const trees = await Tree.find(filter)
      .populate({
        path: "projectId",
        select: "name createdBy",
        populate: { path: "createdBy", select: "fullName email" },
      })
      .limit(limit)
      .skip(skip)
      .sort({ updatedAt: -1 });

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
    console.error("GET /api/admin/disputes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch disputes" },
      { status: 500 },
    );
  }
}
