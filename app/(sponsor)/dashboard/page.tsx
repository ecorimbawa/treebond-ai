// @/app/(sponsor)/dashboard/page.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRight, Camera, ShieldCheck, Sprout } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { TreeStatusPill } from "@/components/tree/TreeStatusPill";
import type { IProject } from "@/models/Project";
import type { ITree, TreeStatus } from "@/models/Tree";

type OwnedTree = Omit<ITree, "projectId"> & {
  _id: string;
  projectId: IProject | null;
};

type Activity = {
  type: "evidence" | "verification";
  treeId: string;
  treeCode: string;
  species: string;
  label: string;
  date: string;
};

const HEALTHY: TreeStatus[] = ["SPONSORED", "MONITORING", "MATURE"];
const WARNING: TreeStatus[] = ["DISPUTED"];
const AT_RISK: TreeStatus[] = ["DEAD", "REMOVED", "REPLACED"];

export default function SponsorDashboardPage() {
  const { address, isConnected } = useAccount();
  const [trees, setTrees] = useState<OwnedTree[]>([]);
  const [totalVerified, setTotalVerified] = useState(0);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setTrees([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/dashboard/sponsor?ownerWallet=${address}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        setTrees(json.data.trees);
        setTotalVerified(json.data.totalVerified);
        setActivity(json.data.recentActivity);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-sm font-bold text-[#667069]">
          Connect your wallet to see the trees you've sponsored.
        </p>
        <div className="mt-6 flex justify-center">
          <ConnectButton />
        </div>
      </main>
    );
  }

  const healthy = trees.filter((t) => HEALTHY.includes(t.status)).length;
  const warning = trees.filter((t) => WARNING.includes(t.status)).length;
  const atRisk = trees.filter((t) => AT_RISK.includes(t.status)).length;

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-12 lg:px-8">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        SPONSOR · MY TREES
      </p>
      <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Trees sponsored by {address?.slice(0, 6)}…{address?.slice(-4)}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Total trees" value={trees.length} />
        <Stat label="Healthy" value={healthy} accent="#246B45" />
        <Stat label="Warning" value={warning} accent="#B7791F" />
        <Stat label="At risk" value={atRisk} accent="#B3402F" />
        <Stat label="Total verified" value={totalVerified} accent="#3154D5" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="text-lg font-extrabold text-[#163D2A]">My Trees</h2>
          <div className="mt-4">
            {isLoading ? (
              <p className="text-sm text-[#929A94]">Loading…</p>
            ) : trees.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-[#d9e2da] py-20 text-center">
                <Sprout
                  size={28}
                  className="text-[#9ec6aa]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-extrabold text-[#163D2A]">
                  No trees sponsored yet
                </p>
                <Link
                  href="/explore"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#246B45] hover:text-[#163D2A]"
                >
                  Explore trees to sponsor{" "}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {trees.map((tree) => (
                  <li key={tree._id}>
                    <Link
                      href={`/trees/${tree._id}`}
                      className="block rounded-2xl border border-[#e2e7e2] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#9ec6aa]"
                    >
                      <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#929A94]">
                        {tree.treeCode}
                      </p>
                      <h3 className="mt-1 text-lg font-extrabold text-[#163D2A]">
                        {tree.species}
                      </h3>
                      <div className="mt-3">
                        <TreeStatusPill status={tree.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-[#163D2A]">
            Recent Activity
          </h2>
          <div className="mt-4 rounded-2xl border border-[#e2e7e2] bg-white p-5">
            {activity.length === 0 ? (
              <p className="text-sm text-[#929A94]">
                No monitoring activity yet — check back after your trees' first
                evidence upload.
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.map((item, index) => (
                  <li
                    key={`${item.type}-${item.treeId}-${item.date}-${index}`}
                    className="flex gap-3 border-b border-[#f1f3f1] pb-4 last:border-0 last:pb-0"
                  >
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#F3F5F1] text-[#246B45]">
                      {item.type === "evidence" ? (
                        <Camera size={14} aria-hidden="true" />
                      ) : (
                        <ShieldCheck size={14} aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#163D2A]">
                        {item.treeCode} · {item.species}
                      </p>
                      <p className="text-sm text-[#667069]">{item.label}</p>
                      <p className="mt-0.5 text-xs text-[#929A94]">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent = "#163D2A",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e7e2] bg-white p-5">
      <p className="text-xs font-bold text-[#929A94]">{label.toUpperCase()}</p>
      <p className="mt-1 text-2xl font-extrabold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}
