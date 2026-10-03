// @/app/(public)/projects/[projectId]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connection";
import { TREE_STATUS_LABEL } from "@/lib/tree-status";
import { Project, Tree } from "@/models";
import type { TreeStatus } from "@/models/Tree";

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[projectId]">,
) {
  const { projectId } = await props.params;

  await connectDB();
  const project = await Project.findById(projectId).lean();
  if (!project) notFound();

  const trees = await Tree.find({ projectId }).sort({ createdAt: -1 }).lean();

  return (
    <main className="mx-auto max-w-[1000px] px-5 py-12">
      <Link
        href="/explore"
        className="text-sm font-bold text-[#667069] hover:text-[#163D2A]"
      >
        ← Back to Tree Explorer
      </Link>
      <p className="mt-4 text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        PROJECT
      </p>
      <h1 className="mt-2 text-balance text-4xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        {project.name}
      </h1>
      <p className="mt-2 text-base text-[#667069]">
        {project.village}, {project.regency}, {project.province},{" "}
        {project.country}
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#667069]">
        {project.description}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Area" value={`${project.areaHectares} ha`} />
        <Stat label="Target trees" value={String(project.targetTreeCount)} />
        <Stat label="Registered trees" value={String(trees.length)} />
        <Stat label="Status" value={project.status} />
      </dl>

      <h2 className="mt-10 text-lg font-extrabold text-[#163D2A]">
        Trees in this project
      </h2>
      {trees.length === 0 ? (
        <p className="mt-4 text-sm text-[#929A94]">No trees registered yet.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trees.map((tree) => (
            <li key={tree._id.toString()}>
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
                  {TREE_STATUS_LABEL[tree.status as TreeStatus]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e2e7e2] bg-white p-4">
      <p className="text-xs font-bold text-[#929A94]">{label.toUpperCase()}</p>
      <p className="mt-1 text-lg font-extrabold text-[#163D2A]">{value}</p>
    </div>
  );
}
