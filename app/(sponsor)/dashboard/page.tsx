// @/app/(sponsor)/dashboard/page.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRight, Sprout } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { TREE_STATUS_LABEL } from "@/lib/tree-status";
import type { IProject } from "@/models/Project";
import type { ITree } from "@/models/Tree";

type OwnedTree = Omit<ITree, "projectId"> & {
  _id: string;
  projectId: IProject | null;
};

export default function SponsorDashboardPage() {
  const { address, isConnected } = useAccount();
  const [trees, setTrees] = useState<OwnedTree[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setTrees([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/trees?ownerWallet=${address}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) setTrees(json.data);
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

  const monitoring = trees.filter((t) => t.status === "MONITORING").length;
  const dead = trees.filter((t) => t.status === "DEAD").length;
  const healthy = trees.length - monitoring - dead;

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-12 lg:px-8">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        SPONSOR · MY TREES
      </p>
      <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Trees sponsored by {address?.slice(0, 6)}…{address?.slice(-4)}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e2e7e2] bg-white p-5">
          <p className="text-xs font-bold text-[#929A94]">TOTAL TREES</p>
          <p className="mt-1 text-2xl font-extrabold text-[#163D2A]">
            {trees.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e2e7e2] bg-white p-5">
          <p className="text-xs font-bold text-[#929A94]">HEALTHY</p>
          <p className="mt-1 text-2xl font-extrabold text-[#246B45]">
            {healthy}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e2e7e2] bg-white p-5">
          <p className="text-xs font-bold text-[#929A94]">MONITORING / DEAD</p>
          <p className="mt-1 text-2xl font-extrabold text-[#B7791F]">
            {monitoring} / {dead}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm text-[#929A94]">Loading…</p>
        ) : trees.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-[#d9e2da] py-20 text-center">
            <Sprout size={28} className="text-[#9ec6aa]" aria-hidden="true" />
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
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#DDEEE3] px-2.5 py-1 text-[10px] font-extrabold text-[#246B45]">
                    {TREE_STATUS_LABEL[tree.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
