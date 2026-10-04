// @/app/admin/projects/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminProjectsTable } from "@/components/admin/AdminProjectsTable";

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        ADMIN · PROJECTS
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        All Projects
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[#667069]">
        Every project on the platform, regardless of which operator created it.
        Open a project for its full public detail page.
      </p>

      <div className="mt-8">
        <AdminProjectsTable />
      </div>
    </main>
  );
}
