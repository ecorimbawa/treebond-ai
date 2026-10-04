import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Tree, TreeEvidence, Verification } from "@/models";

type Activity = {
  type: "evidence" | "verification";
  treeId: string;
  treeCode: string;
  species: string;
  label: string;
  date: Date;
};

// Dashboard aggregate for the sponsor's wallet: owned trees, how many of
// their verification events have actually passed (PRD §72's "Total
// Verified"), and a merged recent-activity feed across evidence +
// verification records — the closest honest substitute for push
// notifications (PRD §8's "Receive Monitoring Updates") without building a
// full notification system.
export async function GET(request: NextRequest) {
  try {
    const ownerWallet = new URL(request.url).searchParams
      .get("ownerWallet")
      ?.toLowerCase();
    if (!ownerWallet) {
      return NextResponse.json(
        { success: false, error: "ownerWallet query param is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const trees = await Tree.find({ ownerWallet })
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
        data: { trees, totalVerified, recentActivity: activity },
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
