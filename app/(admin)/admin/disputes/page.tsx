// @/app/admin/disputes/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDisputesTable } from "@/components/admin/AdminDisputesTable";

export default async function AdminDisputesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        ADMIN · DISPUTES
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Dispute Queue
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[#667069]">
        TreeRegistry has no on-chain path out of DISPUTED — every status can
        transition into it, none can transition out. Resolving a tree here only
        updates MongoDB; the contract&rsquo;s own record will keep showing
        DISPUTED until TreeRegistry is upgraded with a real resolution function.
      </p>

      <div className="mt-8">
        <AdminDisputesTable />
      </div>
    </main>
  );
}
