import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { linkedAddressesFor } from "@/lib/wallet-account";
import { Tree, TreeEvidence, Verification } from "@/models";

type Activity = {
  type: "evidence" | "verification";
  treeId: string;
  treeCode: string;
  species: string;
  label: string;
  date: Date;
};

// Dashboard aggregate for the signed-in sponsor: owned trees across every
// wallet linked to the account, how many of their verification events have
// actually passed (PRD §72's "Total Verified"), and a merged recent-activity
// feed across evidence + verification records — the closest honest substitute
// for push notifications (PRD §8's "Receive Monitoring Updates") without
// building a full notification system.
//
// Scoped by session rather than an `ownerWallet` query param: the param
// version let anyone enumerate any wallet's portfolio, and pinned the
// dashboard to whichever wallet happened to be connected instead of the
// account's own.
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
    const addresses = await linkedAddressesFor(session.user.id);

    if (addresses.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            trees: [],
            totalVerified: 0,
            recentActivity: [],
            linkedWallets: 0,
          },
        },
        { status: 200 },
      );
    }

    const trees = await Tree.find({ ownerWallet: { $in: addresses } })
      .populate("projectId")
      .sort({ createdAt: -1 });
    const treeIds = trees.map((t) => t._id);

    const totalVerified = await Verification.countDocuments({
      treeId: { $in: treeIds },
      status: { $in: ["APPROVED", "ON_CHAIN"] },
    });

    const [recentEvidence, recentVerifications] = await Promise.all([
      TreeEvidence.find({ treeId: { $in: treeIds } })
        .populate("treeId", "treeCode species")
        .sort({ capturedAt: -1 })
        .limit(5),
      Verification.find({ treeId: { $in: treeIds } })
        .populate("treeId", "treeCode species")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const activity: Activity[] = [
      ...recentEvidence
        .filter((e) => e.treeId)
        .map((e) => {
          const tree = e.treeId as unknown as {
            _id: { toString(): string };
            treeCode: string;
            species: string;
          };
          return {
            type: "evidence" as const,
            treeId: tree._id.toString(),
            treeCode: tree.treeCode,
            species: tree.species,
            label: `${e.type.replaceAll("_", " ")} evidence submitted`,
            date: e.capturedAt,
          };
        }),
      ...recentVerifications
        .filter((v) => v.treeId)
        .map((v) => {
          const tree = v.treeId as unknown as {
            _id: { toString(): string };
            treeCode: string;
            species: string;
          };
          return {
            type: "verification" as const,
            treeId: tree._id.toString(),
            treeCode: tree.treeCode,
            species: tree.species,
            label: `Verification ${v.decision} (score ${v.verificationScore})`,
            date: v.createdAt,
          };
        }),
    ]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 8);

    return NextResponse.json(
      {
        success: true,
        data: {
          trees,
          totalVerified,
          recentActivity: activity,
          linkedWallets: addresses.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/dashboard/sponsor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load sponsor dashboard" },
      { status: 500 },
    );
  }
}
