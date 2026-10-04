import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/models";

const bodySchema = z.object({
  role: z.enum(["sponsor", "operator", "verifier", "admin"]),
});

// Mongo-side-only role change — separate from the on-chain Grant Role form
// (components/admin/GrantRoleForm.tsx), which grants OPERATOR_ROLE/
// VERIFIER_ROLE on TreeRegistry. A user needs both before they can actually
// act as operator/verifier: this unlocks the app's UI, that unlocks the
// contract.
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

    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot change your own role" },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(await request.json());
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

    const updated = await User.findByIdAndUpdate(
      id,
      { role: parsed.data.role },
      { new: true },
    ).select("email fullName role createdAt");

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/role error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
