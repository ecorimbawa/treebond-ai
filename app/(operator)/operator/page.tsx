// @/app/operator/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default function OperatorDashboardPage() {
  return (
    <RouteStub
      audience="Operator"
      title="Operator Dashboard"
      route="/operator"
      description="Project and tree counts at a glance: total projects, total trees, pending verifications, healthy trees, warnings, dead trees, and a feed of recent evidence uploads."
      prdRef="PRD.md Section 73"
      links={[
        { label: "Project Management", href: "/operator/projects" },
        { label: "Create Project", href: "/operator/projects/new" },
      ]}
    />
  );
}
