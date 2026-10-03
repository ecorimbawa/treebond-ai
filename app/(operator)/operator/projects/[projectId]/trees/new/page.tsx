// @/app/operator/projects/[projectId]/trees/new/page.tsx
import { notFound } from "next/navigation";
import { RegisterTreeForm } from "@/components/operator/RegisterTreeForm";
import { connectDB } from "@/lib/db/connection";
import { Project } from "@/models";

export default async function OperatorRegisterTreePage(
  props: PageProps<"/operator/projects/[projectId]/trees/new">,
) {
  const { projectId } = await props.params;

  await connectDB();
  const project = await Project.findById(projectId).lean();
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        OPERATOR · REGISTER TREE
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Register Tree — {project.name}
      </h1>

      {project.onChainProjectId == null ? (
        <p className="mt-6 rounded-xl border border-dashed border-[#d9e2da] p-4 text-sm text-[#B7791F]">
          This project has not been confirmed on-chain yet. Create it through{" "}
          <span className="font-bold">New Project</span> before registering
          trees under it.
        </p>
      ) : (
        <RegisterTreeForm
          mongoProjectId={project._id.toString()}
          onChainProjectId={project.onChainProjectId}
        />
      )}
    </main>
  );
}
