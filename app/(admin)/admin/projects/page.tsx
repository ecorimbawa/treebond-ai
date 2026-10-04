// @/app/admin/projects/page.tsx
import { Blocks } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminProjectsTable } from "@/components/admin/AdminProjectsTable";
import { Callout, ConsoleMain, PageHeader } from "@/components/console/ui";

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <ConsoleMain>
      <PageHeader
        eyebrow="ADMIN · PROJECTS"
        title="All Projects"
        description="Every project on the platform, regardless of which operator created it. Open a project for its full public detail page."
      />

      <div className="mt-8 max-w-3xl">
        <Callout
          tone="chain"
          icon={<Blocks size={16} aria-hidden="true" />}
          title="Read-only by design"
        >
          Creating a project needs a real <code>createProject()</code>{" "}
          transaction on TreeRegistry, which operators sign from{" "}
          <code>/operator/projects/new</code>. Anything authored here would be
          permanently stuck &ldquo;NOT ON-CHAIN&rdquo;, so admin&rsquo;s job for
          projects is oversight, not authoring.
        </Callout>
      </div>

      <div className="mt-8">
        <AdminProjectsTable />
      </div>
    </ConsoleMain>
  );
}
