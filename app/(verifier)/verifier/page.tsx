// @/app/verifier/page.tsx

import type { Types } from "mongoose";
import Link from "next/link";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { TreeEvidence } from "@/models";
import type { ITree } from "@/models/Tree";
import type { ITreeEvidence } from "@/models/TreeEvidence";

type PendingEvidence = Omit<ITreeEvidence, "treeId"> & {
  _id: Types.ObjectId;
  treeId: ITree | null;
};

export default async function VerifierQueuePage() {
  const session = await auth();

  await connectDB();
  const pending =
    session?.user?.role === "verifier"
      ? ((await TreeEvidence.find({ status: "pending" })
          .populate("treeId")
          .sort({ capturedAt: -1 })
          .lean()) as PendingEvidence[])
      : [];

  return (
    <main className="mx-auto max-w-[1000px] px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        VERIFIER · QUEUE
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Verification Queue
      </h1>

      {pending.length === 0 ? (
        <p className="mt-10 text-sm text-[#929A94]">
          No evidence pending review.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-[#e2e7e2] rounded-2xl border border-[#e2e7e2] bg-white">
          {pending.map((evidence) => (
            <li
              key={evidence._id.toString()}
              className="flex items-center justify-between p-5"
            >
              <div>
                <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#929A94]">
                  {evidence.treeId?.treeCode}
                </p>
                <p className="font-extrabold text-[#163D2A]">
                  {evidence.treeId?.species} ·{" "}
                  {evidence.type.replaceAll("_", " ")}
                </p>
                <p className="text-sm text-[#667069]">
                  Captured {new Date(evidence.capturedAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/verifier/${evidence._id}`}
                className="inline-flex h-10 items-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
              >
                Review
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
