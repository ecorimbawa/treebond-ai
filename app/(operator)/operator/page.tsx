// @/app/operator/page.tsx
import Link from "next/link";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Project, Tree } from "@/models";

async function getOperatorStats(userId: string) {
  await connectDB();
  const projects = await Project.find({ createdBy: userId }).select("_id");
  const projectIds = projects.map((p) => p._id);

  const [treeCount, pendingVerification, healthy, dead] = await Promise.all([
    Tree.countDocuments({ projectId: { $in: projectIds } }),
    Tree.countDocuments({
      projectId: { $in: projectIds },
      status: "PENDING_VERIFICATION",
    }),
    Tree.countDocuments({
      projectId: { $in: projectIds },
      status: {
        $in: ["VERIFIED", "AVAILABLE", "SPONSORED", "MONITORING", "MATURE"],
      },
    }),
    Tree.countDocuments({ projectId: { $in: projectIds }, status: "DEAD" }),
  ]);

  return {
    projectCount: projects.length,
    treeCount,
    pendingVerification,
    healthy,
    dead,
  };
}

export default async function OperatorDashboardPage() {
  const session = await auth();
  const stats = session?.user
    ? await getOperatorStats(session.user.id)
    : {
        projectCount: 0,
        treeCount: 0,
        pendingVerification: 0,
        healthy: 0,
        dead: 0,
      };

  return (
    <main className="mx-auto max-w-[1000px] px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        OPERATOR · DASHBOARD
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Operator Dashboard
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Projects" value={stats.projectCount} />
        <Stat label="Trees" value={stats.treeCount} />
        <Stat label="Pending Verification" value={stats.pendingVerification} />
        <Stat label="Healthy" value={stats.healthy} accent="#246B45" />
        <Stat label="Dead" value={stats.dead} accent="#B3402F" />
      </div>

      <div className="mt-10 flex gap-4">
        <Link
          href="/operator/projects"
          className="inline-flex h-11 items-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
        >
          Project Management
        </Link>
        <Link
          href="/operator/projects/new"
          className="inline-flex h-11 items-center rounded-xl border border-[#d9e2da] px-4 text-sm font-bold text-[#163D2A] hover:border-[#246B45]"
        >
          Create Project
        </Link>
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
