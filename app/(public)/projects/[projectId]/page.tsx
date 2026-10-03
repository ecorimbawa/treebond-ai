// @/app/(public)/projects/[projectId]/page.tsx
import {
  ArrowLeft,
  Blocks,
  Layers,
  MapPin,
  Sprout,
  Target,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { TreeStatusPill } from "@/components/tree/TreeStatusPill";
import { connectDB } from "@/lib/db/connection";
import { Project, Tree } from "@/models";
import type { TreeStatus } from "@/models/Tree";

const PROJECT_STATUS_STYLE: Record<string, string> = {
  active: "bg-[#DDEEE3] text-[#246B45]",
  paused: "bg-[#FBEFD9] text-[#B7791F]",
  completed: "bg-[#e7ebfc] text-[#3154D5]",
  archived: "bg-[#F3F5F1] text-[#667069]",
};

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[projectId]">,
) {
  const { projectId } = await props.params;

  await connectDB();
  const project = await Project.findById(projectId).lean();
  if (!project) notFound();

  const trees = await Tree.find({ projectId }).sort({ createdAt: -1 }).lean();

  return (
    <main className="min-h-dvh bg-[#FAFAF7] text-[#18201B]">
      <header className="sticky top-0 z-40 border-b border-[#e2e7e2] bg-[#FAFAF7]/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#667069] transition hover:text-[#163D2A]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Explorer
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe2d4] bg-[#eff7f1] px-3 py-1.5 text-xs font-bold text-[#246B45]">
          <MapPin size={14} aria-hidden="true" />
          {project.regency}, {project.province}
        </div>
        <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.05em] text-[#163D2A] sm:text-5xl">
          {project.name}
        </h1>
        <p className="mt-2 text-sm text-[#929A94]">
          {project.village}, {project.regency}, {project.province},{" "}
          {project.country}
        </p>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#667069]">
          {project.description}
        </p>
        <span
          className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
            PROJECT_STATUS_STYLE[project.status] ??
            PROJECT_STATUS_STYLE.archived
          }`}
        >
          {project.status.toUpperCase()}
        </span>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            icon={<Layers size={16} aria-hidden="true" />}
            label="Area"
            value={`${project.areaHectares} ha`}
          />
          <Stat
            icon={<Target size={16} aria-hidden="true" />}
            label="Target trees"
            value={project.targetTreeCount.toLocaleString()}
          />
          <Stat
            icon={<Sprout size={16} aria-hidden="true" />}
            label="Registered"
            value={String(trees.length)}
          />
          <Stat
            icon={<Blocks size={16} aria-hidden="true" />}
            label="On-chain"
            value={
              project.onChainProjectId != null
                ? `#${project.onChainProjectId}`
                : "Not yet"
            }
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 pb-24 lg:px-8">
        <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
          TREES IN THIS PROJECT
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
          {trees.length} {trees.length === 1 ? "tree" : "trees"} registered so
          far
        </h2>

        {trees.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-[#d9e2da] py-24 text-center">
            <Sprout size={28} className="text-[#9ec6aa]" aria-hidden="true" />
            <p className="mt-3 font-extrabold text-[#163D2A]">
              No trees registered yet
            </p>
            <p className="mt-1 text-sm text-[#667069]">
              Check back once the operator starts planting.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trees.map((tree) => (
              <Link
                key={tree._id.toString()}
                href={`/trees/${tree._id}`}
                className="block overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white transition hover:-translate-y-0.5 hover:border-[#9ec6aa]"
              >
                <div className="grid h-32 place-items-center bg-[#F3F5F1]">
                  <Sprout
                    size={28}
                    className="text-[#9ec6aa]"
                    aria-hidden="true"
                  />
                </div>
                <div className="p-5">
                  <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#929A94]">
                    {tree.treeCode}
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-[#163D2A]">
                    {tree.species}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <TreeStatusPill status={tree.status as TreeStatus} />
                    <span className="text-xs text-[#929A94]">
                      Planted {new Date(tree.plantedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e7e2] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#9ec6aa]">
      <div className="flex items-center gap-1.5 text-[#246B45]">
        {icon}
        <p className="text-xs font-bold text-[#929A94]">
          {label.toUpperCase()}
        </p>
      </div>
      <p className="mt-2 text-lg font-extrabold text-[#163D2A]">{value}</p>
    </div>
  );
}
