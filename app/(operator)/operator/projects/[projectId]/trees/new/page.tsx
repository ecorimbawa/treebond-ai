// @/app/operator/projects/[projectId]/trees/new/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default async function OperatorRegisterTreePage(
  props: PageProps<"/operator/projects/[projectId]/trees/new">,
) {
  const { projectId } = await props.params;

  return (
    <RouteStub
      audience="Operator"
      title={`Register Tree — Project ${projectId}`}
      route="/operator/projects/[projectId]/trees/new"
      description="Form to register a new tree under this project: species, coordinates, planted date, initial height, initial diameter, initial photo, and notes. A tree_code such as TREE-JTG-000192 is generated automatically."
      prdRef="PRD.md Section 24"
      links={[{ label: "Project Management", href: "/operator/projects" }]}
    />
  );
}
