import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/models";

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
    const role = searchParams.get("role");

    const filter: Record<string, string> = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select("email fullName role createdAt")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: users,
        pagination: { total, limit, skip, hasMore: skip + limit < total },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  role: z.enum(["sponsor", "operator", "verifier", "admin"]),
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
    const { email, password, fullName, role } = parsed.data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      fullName,
      role,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 },
    );
  }
}
