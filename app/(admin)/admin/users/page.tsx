// @/app/admin/users/page.tsx
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AdminMain, Callout, PageHeader } from "@/components/admin/ui";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <AdminMain>
      <PageHeader
        eyebrow="ADMIN · USERS"
        title="User Management"
        description="Every account on the platform — create new ones, correct names and emails, and move people between sponsor, operator, verifier and admin."
      />

      <div className="mt-8 max-w-3xl">
        <Callout
          tone="chain"
          icon={<KeyRound size={16} aria-hidden="true" />}
          title="App roles aren't on-chain roles"
        >
          Changing a role here only updates MongoDB. Operators and verifiers
          also need their wallet granted the matching on-chain role from the{" "}
          <Link
            href="/admin"
            className="font-bold underline decoration-2 underline-offset-2"
          >
            Grant Role
          </Link>{" "}
          form before they can actually transact as that role.
        </Callout>
      </div>

      <div className="mt-8">
        <AdminUsersTable currentUserId={session.user.id} />
      </div>
    </AdminMain>
  );
}
