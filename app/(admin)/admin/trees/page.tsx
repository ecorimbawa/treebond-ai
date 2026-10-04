// @/app/admin/trees/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTreesTable } from "@/components/admin/AdminTreesTable";

export default async function AdminTreesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        ADMIN · TREES
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        All Trees
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[#667069]">
        Every tree on the platform. Filter by status, project, or operator to
        investigate, then open a tree for its full Tree Passport.
      </p>

      <div className="mt-8">
        <AdminTreesTable />
      </div>
    </main>
  );
}
