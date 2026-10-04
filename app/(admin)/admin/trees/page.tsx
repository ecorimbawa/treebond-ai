// @/app/admin/trees/page.tsx
import { Sprout } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTreesTable } from "@/components/admin/AdminTreesTable";
import { Callout, ConsoleMain, PageHeader } from "@/components/console/ui";

export default async function AdminTreesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <ConsoleMain>
      <PageHeader
        eyebrow="ADMIN · TREES"
        title="All Trees"
        description="Every tree on the platform. Filter by status, project or operator to investigate, then open a tree for its full Tree Passport."
      />

      <div className="mt-8 max-w-3xl">
        <Callout
          tone="note"
          icon={<Sprout size={16} aria-hidden="true" />}
          title="Field data only"
        >
          Species, coordinates, planting date and heights are editable here to
          fix bad field entries. Status, token ID and owner wallet aren&rsquo;t
          — those are synced from on-chain events, and a tree that already has a
          token ID can no longer be deleted.
        </Callout>
      </div>

      <div className="mt-8">
        <AdminTreesTable />
      </div>
    </ConsoleMain>
  );
}
