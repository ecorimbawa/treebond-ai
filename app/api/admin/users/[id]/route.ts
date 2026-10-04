import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Project, User } from "@/models";

const updateSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

// Profile fields only — role changes stay on the dedicated /role route
// (a more sensitive, separately-audited action).
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

    const update: Record<string, string> = {};
    if (parsed.data.fullName) update.fullName = parsed.data.fullName;
    if (parsed.data.email) update.email = parsed.data.email.toLowerCase();

    const updated = await User.findByIdAndUpdate(id, update, {
      new: true,
    }).select("email fullName role createdAt");
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
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

    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    const ownedProjects = await Project.countDocuments({ createdBy: id });
    if (ownedProjects > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete: this user created ${ownedProjects} project(s). Reassign or remove those first.`,
        },
        { status: 400 },
      );
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: { _id: id } },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
