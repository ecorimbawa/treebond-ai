// @/app/operator/projects/page.tsx
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Project } from "@/models";

export default async function OperatorProjectsPage() {
  const session = await auth();

  await connectDB();
  const projects = session?.user
    ? await Project.find({ createdBy: session.user.id })
        .sort({ createdAt: -1 })
        .lean()
    : [];

  return (
    <main className="mx-auto max-w-[1000px] px-5 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
            OPERATOR · PROJECTS
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
            Project Management
          </h1>
        </div>
        <Link
          href="/operator/projects/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
        >
          <Plus size={16} aria-hidden="true" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-[#d9e2da] py-20 text-center">
          <p className="font-extrabold text-[#163D2A]">No projects yet</p>
          <Link
            href="/operator/projects/new"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#246B45] hover:text-[#163D2A]"
          >
            Create your first project{" "}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-[#e2e7e2] rounded-2xl border border-[#e2e7e2] bg-white">
          {projects.map((project) => (
            <li
              key={project._id.toString()}
              className="flex items-center justify-between p-5"
            >
              <div>
                <Link
                  href={`/projects/${project._id}`}
                  className="font-extrabold text-[#163D2A] hover:text-[#246B45] hover:underline"
                >
                  {project.name}
                </Link>
                <p className="text-sm text-[#667069]">
                  {project.regency}, {project.province} ·{" "}
                  {project.targetTreeCount} trees target
                </p>
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                    project.onChainProjectId != null
                      ? "bg-[#DDEEE3] text-[#246B45]"
                      : "bg-[#FBEFD9] text-[#B7791F]"
                  }`}
                >
                  {project.onChainProjectId != null
                    ? `ON-CHAIN #${project.onChainProjectId}`
                    : "NOT ON-CHAIN"}
                </span>
              </div>
              <Link
                href={`/operator/projects/${project._id}/trees/new`}
                className="inline-flex items-center gap-1 text-sm font-bold text-[#246B45] hover:text-[#163D2A]"
              >
                Register Tree <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
