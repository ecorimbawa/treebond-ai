// @/app/operator/projects/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default function OperatorProjectsPage() {
  return (
    <RouteStub
      audience="Operator"
      title="Project Management"
      route="/operator/projects"
      description="Every reforestation project this operator manages — name, location, area, tree target, and species — with a shortcut into each project to register new trees."
      prdRef="PRD.md Section 23"
      links={[
        { label: "Create a new project", href: "/operator/projects/new" },
        { label: "Operator Dashboard", href: "/operator" },
      ]}
    />
  );
}
