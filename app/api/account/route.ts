import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/models";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Sign in required" },
        { status: 401 },
      );
    }

    await connectDB();
    const user = await User.findById(session.user.id).select(
      "email fullName role placeholderEmail createdAt",
    );
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id.toString(),
          // A synthetic address is an implementation detail — the UI should
          // show "not set", not 0xabc…@wallet.treebond.local.
          email: user.placeholderEmail ? "" : user.email,
          fullName: user.fullName,
          role: user.role,
          placeholderEmail: user.placeholderEmail,
          createdAt: user.createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/account error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load account" },
      { status: 500 },
    );
  }
}

const patchSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  currentPassword: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Sign in required" },
        { status: 401 },
      );
    }

    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid payload",
        },
        { status: 400 },
      );
    }
    const { fullName, email, password, currentPassword } = parsed.data;

    await connectDB();
    const user = await User.findById(session.user.id).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 },
      );
    }

    const isWalletOnly = user.placeholderEmail === true;

    // A wallet-only account has a random password hash nobody knows, so its
    // first email and password must arrive together — an email without a
    // password is an address that can never actually be signed in with.
    if (isWalletOnly && email && !password) {
      return NextResponse.json(
        { success: false, error: "Choose a password for this email too" },
        { status: 400 },
      );
    }

    // Changing an existing password needs the old one. Wallet-only accounts
    // are exempt: the session itself already proves wallet control, which is
    // the only credential they have.
    if (password && !isWalletOnly) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Enter your current password" },
          { status: 400 },
        );
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 },
        );
      }
    }

    if (email && email.toLowerCase() !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase() });
      if (taken) {
        return NextResponse.json(
          { success: false, error: "That email is already in use" },
          { status: 409 },
        );
      }
      user.email = email.toLowerCase();
      user.placeholderEmail = false;
    }

    if (fullName) user.fullName = fullName;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id.toString(),
          email: user.placeholderEmail ? "" : user.email,
          fullName: user.fullName,
          role: user.role,
          placeholderEmail: user.placeholderEmail,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/account error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update account" },
      { status: 500 },
    );
  }
}
