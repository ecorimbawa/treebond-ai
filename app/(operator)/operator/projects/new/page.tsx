// @/app/operator/projects/new/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default function OperatorCreateProjectPage() {
  return (
    <RouteStub
      audience="Operator"
      title="Create Project"
      route="/operator/projects/new"
      description="Form to register a new reforestation project: name, description, country, province, regency, village, coordinates, area, tree target, species, start date, and a cover image."
      prdRef="PRD.md Section 23"
      links={[{ label: "Project Management", href: "/operator/projects" }]}
    />
  );
}
