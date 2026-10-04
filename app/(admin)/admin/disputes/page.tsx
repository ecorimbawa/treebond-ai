// @/app/admin/disputes/page.tsx
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDisputesTable } from "@/components/admin/AdminDisputesTable";
import { AdminMain, Callout, PageHeader } from "@/components/admin/ui";

export default async function AdminDisputesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <AdminMain>
      <PageHeader
        eyebrow="ADMIN · DISPUTES"
        title="Dispute Queue"
        description="Trees flagged DISPUTED, waiting on a human decision. Pick the status each one should return to — the queue clears as you resolve them."
      />

      <div className="mt-8 max-w-3xl">
        <Callout
          tone="chain"
          icon={<ShieldAlert size={16} aria-hidden="true" />}
          title="DISPUTED is a one-way door on-chain"
        >
          TreeRegistry has no on-chain path out of DISPUTED — every status can
          transition into it, none can transition out. Resolving a tree here
          only updates MongoDB; the contract&rsquo;s own record will keep
          showing DISPUTED until TreeRegistry is upgraded with a real resolution
          function.
        </Callout>
      </div>

      <div className="mt-8">
        <AdminDisputesTable />
      </div>
    </AdminMain>
  );
}
