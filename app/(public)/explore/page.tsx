// @/app/(public)/explore/page.tsx
"use client";

import { ArrowRight, Blocks, MapPin, Search, Sprout } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { TreeStatusPill } from "@/components/tree/TreeStatusPill";
import type { IProject } from "@/models/Project";
import type { ITree, TreeStatus } from "@/models/Tree";

type ExploreTree = Omit<ITree, "projectId"> & {
  _id: string;
  projectId: IProject | null;
};

type FilterValue = TreeStatus | "all" | "sponsorable";

const statusFilters: { value: FilterValue; label: string }[] = [
  { value: "sponsorable", label: "Sponsorable now" },
  { value: "all", label: "All" },
  { value: "AVAILABLE", label: "Available" },
  { value: "MONITORING", label: "Monitoring" },
  { value: "SPONSORED", label: "Sponsored" },
];

// A tree is only buyable once it exists on TreeRegistry — a Mongo-only tree
// renders a passport with no price and no Sponsor button, which is a dead end
// for anyone browsing to sponsor.
const isSponsorable = (tree: ExploreTree) =>
  tree.tokenId != null && tree.status === "AVAILABLE";

function TreeCard({ tree }: { tree: ExploreTree }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white transition hover:-translate-y-0.5 hover:border-[#9ec6aa]">
      {tree.metadataCid ? (
        // biome-ignore lint/performance/noImgElement: tree.metadataCid is an operator-controlled external gateway URL, not a local/optimizable asset
        <img
          src={tree.metadataCid}
          alt=""
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="grid h-40 place-items-center bg-[#F3F5F1]">
          <Sprout size={32} className="text-[#9ec6aa]" aria-hidden="true" />
        </div>
      )}
      <div className="p-5">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#929A94]">
          {tree.treeCode}
        </p>
        <h3 className="mt-1 text-lg font-extrabold">{tree.species}</h3>
        {tree.projectId ? (
          <Link
            href={`/projects/${tree.projectId._id}`}
            className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[#246B45] transition hover:text-[#163D2A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
          >
            <MapPin size={12} aria-hidden="true" />
            {tree.projectId.name}
          </Link>
        ) : (
          <p className="text-sm text-[#667069]">Unassigned project</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <TreeStatusPill status={tree.status} />
          {isSponsorable(tree) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7ebfc] px-2.5 py-1 text-[10px] font-extrabold text-[#3154D5]">
              <Blocks size={11} aria-hidden="true" />
              TOKEN #{tree.tokenId}
            </span>
          )}
        </div>
        <div className="my-4 border-t border-[#e2e7e2]" />
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#929A94]">
            Planted {new Date(tree.plantedAt).toLocaleDateString()}
          </p>
          <Link
            href={`/trees/${tree._id}`}
            className="inline-flex items-center gap-1 rounded-sm text-sm font-bold text-[#246B45] transition hover:text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
          >
            View Tree <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ExplorePage() {
  const [trees, setTrees] = useState<ExploreTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<FilterValue>("sponsorable");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/trees?limit=60")
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
  }, []);

  const filteredTrees = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trees.filter((tree) => {
      const matchesStatus =
        activeStatus === "all"
          ? true
          : activeStatus === "sponsorable"
            ? isSponsorable(tree)
            : tree.status === activeStatus;
      const matchesQuery =
        q.length === 0 ||
        tree.treeCode.toLowerCase().includes(q) ||
        tree.species.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [activeStatus, query, trees]);

  return (
    <main className="min-h-dvh bg-[#FAFAF7] text-[#18201B]">
      <header className="sticky top-0 z-40 border-b border-[#e2e7e2] bg-[#FAFAF7]/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="flex items-center gap-5">
            <Link
              href="/login"
              className="hidden h-11 items-center rounded-sm text-sm font-bold text-[#667069] transition hover:text-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] sm:inline-flex"
            >
              Log In
            </Link>
            <Link
              href="/create-account"
              className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white transition duration-200 hover:bg-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
            >
              Sponsor a Tree
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-5 pb-8 pt-14 lg:px-8">
        <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
          PUBLIC · TREE EXPLORER
        </p>
        <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-[-0.04em] text-[#163D2A] sm:text-5xl">
          Every tree, tracked in the open.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-[#667069]">
          Browse every public tree on TreeBond AI — search by ID or species,
          filter by status, and open any card for its full Tree Passport: GPS
          location, AI analysis, and on-chain proof.
        </p>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="flex flex-col gap-4 border-y border-[#e2e7e2] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveStatus(filter.value)}
                className={`inline-flex h-9 items-center rounded-full px-4 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] ${
                  activeStatus === filter.value
                    ? "bg-[#163D2A] text-white"
                    : "border border-[#d9e2da] bg-white text-[#667069] hover:border-[#246B45] hover:text-[#163D2A]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#929A94]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID or species..."
              className="h-11 w-full rounded-xl border border-[#d9e2da] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
            />
          </div>
        </div>
        <p className="py-4 text-xs font-bold tracking-wide text-[#929A94]">
          {isLoading
            ? "LOADING…"
            : `${filteredTrees.length} ${filteredTrees.length === 1 ? "TREE" : "TREES"} FOUND`}
        </p>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 pb-24 lg:px-8">
        {filteredTrees.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrees.map((tree) => (
              <TreeCard key={tree._id} tree={tree} />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="grid place-items-center rounded-2xl border border-dashed border-[#d9e2da] py-24 text-center">
              <Sprout size={28} className="text-[#9ec6aa]" aria-hidden="true" />
              <p className="mt-3 font-extrabold text-[#163D2A]">
                No trees match your search
              </p>
              <p className="mt-1 max-w-sm text-sm text-[#667069]">
                {activeStatus === "sponsorable"
                  ? "No tree is registered on-chain and available right now. Switch to All to browse the rest."
                  : "Try a different status filter or search term."}
              </p>
            </div>
          )
        )}
      </section>
    </main>
  );
}
