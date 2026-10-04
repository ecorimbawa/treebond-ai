// @/app/admin/users/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-[1000px] px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        ADMIN · USERS
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        User Management
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[#667069]">
        Changing a role here only updates MongoDB. Operators and verifiers also
        need their wallet granted the matching on-chain role from the{" "}
        <Link
          href="/admin"
          className="font-bold text-[#246B45] hover:underline"
        >
          Grant Role
        </Link>{" "}
        form before they can actually transact as that role.
      </p>

      <div className="mt-8">
        <AdminUsersTable currentUserId={session.user.id} />
      </div>
    </main>
  );
}
