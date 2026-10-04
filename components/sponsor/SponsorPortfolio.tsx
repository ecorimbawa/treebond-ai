"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Ruler,
  ShieldCheck,
  Sprout,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  buttonClass,
  Callout,
  ConsoleMain,
  ErrorBanner,
  mono,
  PageHeader,
  SectionLabel,
} from "@/components/console/ui";
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

export function SponsorPortfolio() {
  const [trees, setTrees] = useState<OwnedTree[]>([]);
  const [totalVerified, setTotalVerified] = useState(0);
  const [linkedWallets, setLinkedWallets] = useState(0);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/sponsor")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) {
          setError(json.error ?? "Failed to load your trees");
          return;
        }
        setTrees(json.data.trees);
        setTotalVerified(json.data.totalVerified);
        setActivity(json.data.recentActivity);
        setLinkedWallets(json.data.linkedWallets);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load your trees");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const healthy = trees.filter((t) => HEALTHY.includes(t.status)).length;
  const warning = trees.filter((t) => WARNING.includes(t.status)).length;
  const atRisk = trees.filter((t) => AT_RISK.includes(t.status)).length;
  const totalGrowthCm = trees.reduce(
    (sum, t) => sum + Math.max(0, t.currentHeightCm - t.initialHeightCm),
    0,
  );

  return (
    <ConsoleMain>
      <PageHeader
        eyebrow="SPONSOR · MY TREES"
        title="The trees you're keeping alive."
        description="Everything sponsored by any wallet linked to your account — with the verification record behind each one."
        actions={
          <>
            <Link href="/explore" className={buttonClass("primary")}>
              Sponsor Another Tree
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard/wallets"
              className={buttonClass("secondary")}
            >
              Manage Wallets
            </Link>
          </>
        }
      />

      {error && (
        <div className="mt-8">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      )}

      {!isLoading && linkedWallets === 0 && (
        <div className="mt-8 max-w-3xl">
          <Callout
            tone="note"
            icon={<Wallet size={16} aria-hidden="true" />}
            title="No wallet linked yet"
          >
            Your sponsored trees are tracked by wallet address.{" "}
            <Link
              href="/dashboard/wallets"
              className="font-bold underline decoration-2 underline-offset-2"
            >
              Link the wallet you sponsored with
            </Link>{" "}
            and they&rsquo;ll show up here automatically.
          </Callout>
        </div>
      )}

      <section className="mt-10">
        <SectionLabel>PORTFOLIO</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={<Sprout size={18} aria-hidden="true" />}
            label="Trees"
            value={trees.length}
            hint={
              linkedWallets === 1
                ? "Across 1 linked wallet"
                : `Across ${linkedWallets} linked wallets`
            }
            isLoading={isLoading}
          />
          <StatCard
            icon={<BadgeCheck size={18} aria-hidden="true" />}
            label="Healthy"
            value={healthy}
            hint="Sponsored, monitoring or mature"
            tone="good"
            isLoading={isLoading}
          />
          <StatCard
            icon={<TriangleAlert size={18} aria-hidden="true" />}
            label="Needs review"
            value={warning}
            hint={warning === 0 ? "Nothing disputed" : "Flagged as disputed"}
            tone={warning > 0 ? "warn" : "muted"}
            isLoading={isLoading}
          />
          <StatCard
            icon={<TriangleAlert size={18} aria-hidden="true" />}
            label="At risk"
            value={atRisk}
            hint={atRisk === 0 ? "None lost" : "Dead, removed or replaced"}
            tone={atRisk > 0 ? "bad" : "muted"}
            isLoading={isLoading}
          />
          <StatCard
            icon={<ShieldCheck size={18} aria-hidden="true" />}
            label="Verified events"
            value={totalVerified}
            hint="Approved or on-chain"
            tone="chain"
            isLoading={isLoading}
          />
        </div>
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-end justify-between gap-4">
            <SectionLabel>MY TREES</SectionLabel>
            {totalGrowthCm > 0 && (
              <p
                className={`${mono} inline-flex items-center gap-1.5 text-[11px] text-[#246B45]`}
              >
                <Ruler size={12} aria-hidden="true" />
                {totalGrowthCm} cm grown since planting
              </p>
            )}
          </div>

          <div className="mt-4">
            {isLoading ? (
              <TreeGridSkeleton />
            ) : trees.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-[#d9e2da] bg-white px-6 py-16 text-center">
                <Image
                  src="/01-removebg-preview.png"
                  alt=""
                  width={72}
                  height={72}
                  className="size-18 opacity-80"
                />
                <p className="mt-4 text-lg font-extrabold tracking-[-0.03em] text-[#163D2A]">
                  No trees sponsored yet
                </p>
                <p className="mt-1 max-w-sm text-sm leading-6 text-[#667069]">
                  Pick an available tree from the explorer. You&rsquo;ll sign
                  one transaction, and its whole monitoring history lands here.
                </p>
                <Link
                  href="/explore"
                  className={`mt-6 ${buttonClass("primary")}`}
                >
                  Explore Trees
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {trees.map((tree) => (
                  <li key={tree._id}>
                    <Link
                      href={`/trees/${tree._id}`}
                      className="group block h-full overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white transition hover:-translate-y-0.5 hover:border-[#9ec6aa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
                    >
                      {tree.metadataCid && (
                        // biome-ignore lint/performance/noImgElement: tree.metadataCid is an operator-controlled external gateway URL, not a local/optimizable asset
                        <img
                          src={tree.metadataCid}
                          alt=""
                          className="h-28 w-full object-cover"
                        />
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`${mono} text-xs text-[#929A94]`}>
                              {tree.treeCode}
                            </p>
                            <h3 className="mt-1 text-lg font-extrabold tracking-[-0.03em] text-[#163D2A]">
                              {tree.species}
                            </h3>
                          </div>
                          {tree.tokenId != null && (
                            <span
                              className={`${mono} shrink-0 rounded-full bg-[#e7ebfc] px-2.5 py-1 text-[10px] font-extrabold text-[#3154D5]`}
                            >
                              #{tree.tokenId}
                            </span>
                          )}
                        </div>

                        {tree.projectId && (
                          <p className="mt-1 text-sm text-[#667069]">
                            {tree.projectId.name}
                          </p>
                        )}

                        <div className="mt-3">
                          <TreeStatusPill status={tree.status} />
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[#f1f3f1] pt-4">
                          <p className="text-xs text-[#929A94]">
                            {tree.currentHeightCm} cm tall
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#246B45]">
                            Passport
                            <ArrowUpRight
                              size={12}
                              aria-hidden="true"
                              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <SectionLabel>RECENT ACTIVITY</SectionLabel>
          <div className="mt-4 rounded-2xl border border-[#e2e7e2] bg-white p-6">
            {isLoading ? (
              <p className="text-sm text-[#929A94]">Loading…</p>
            ) : activity.length === 0 ? (
              <p className="text-sm leading-6 text-[#667069]">
                No monitoring activity yet — this fills up as operators upload
                evidence and verifiers sign off on your trees.
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.map((item) => (
                  <li
                    key={`${item.type}-${item.treeId}-${item.date}`}
                    className="flex gap-3 border-b border-[#f1f3f1] pb-4 last:border-0 last:pb-0"
                  >
                    <span
                      className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ${
                        item.type === "evidence"
                          ? "bg-[#F3F5F1] text-[#246B45]"
                          : "bg-[#e7ebfc] text-[#3154D5]"
                      }`}
                    >
                      {item.type === "evidence" ? (
                        <Camera size={14} aria-hidden="true" />
                      ) : (
                        <ShieldCheck size={14} aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/trees/${item.treeId}`}
                        className="text-sm font-bold text-[#163D2A] transition hover:text-[#246B45]"
                      >
                        {item.treeCode} · {item.species}
                      </Link>
                      <p className="text-sm capitalize text-[#667069]">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[#929A94]">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </ConsoleMain>
  );
}

const statTones = {
  default: { value: "text-[#163D2A]", icon: "bg-[#F3F5F1] text-[#246B45]" },
  good: { value: "text-[#246B45]", icon: "bg-[#DDEEE3] text-[#246B45]" },
  warn: { value: "text-[#B7791F]", icon: "bg-[#FBEFD9] text-[#B7791F]" },
  chain: { value: "text-[#3154D5]", icon: "bg-[#e7ebfc] text-[#3154D5]" },
  bad: { value: "text-[#B3402F]", icon: "bg-[#F7E1DE] text-[#B3402F]" },
  muted: { value: "text-[#929A94]", icon: "bg-[#F3F5F1] text-[#929A94]" },
} as const;

function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "default",
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  tone?: keyof typeof statTones;
  isLoading?: boolean;
}) {
  const style = statTones[tone];
  return (
    <div className="rounded-2xl border border-[#e2e7e2] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#9ec6aa]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-10 place-items-center rounded-xl ${style.icon}`}
        >
          {icon}
        </span>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#929A94]">
          {label}
        </p>
      </div>
      {isLoading ? (
        <span className="mt-6 block h-7 w-12 animate-pulse rounded-full bg-[#eef1ee]" />
      ) : (
        <p
          className={`mt-5 text-3xl font-extrabold tracking-[-0.05em] ${style.value}`}
        >
          {value.toLocaleString()}
        </p>
      )}
      <p className={`${mono} mt-2 text-[11px] leading-4 text-[#929A94]`}>
        {hint}
      </p>
    </div>
  );
}

const SKELETON_CARDS = ["a", "b", "c", "d"];

function TreeGridSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {SKELETON_CARDS.map((key) => (
        <li
          key={key}
          className="rounded-2xl border border-[#e2e7e2] bg-white p-5"
        >
          <span className="block h-3 w-28 animate-pulse rounded-full bg-[#eef1ee]" />
          <span className="mt-3 block h-5 w-36 animate-pulse rounded-full bg-[#eef1ee]" />
          <span className="mt-4 block h-5 w-24 animate-pulse rounded-full bg-[#eef1ee]" />
        </li>
      ))}
    </ul>
  );
}
