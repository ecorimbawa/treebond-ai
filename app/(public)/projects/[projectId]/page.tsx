// @/app/(public)/projects/[projectId]/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[projectId]">,
) {
  const { projectId } = await props.params;

  return (
    <RouteStub
      audience="Public"
      title={`Project Detail — ${projectId}`}
      route="/projects/[projectId]"
      description="Public view of a reforestation project: location, area, tree species, target tree count, and every tree registered under it. Not explicitly named in PRD.md, but implied once Tree Explorer groups trees by project."
      prdRef="PRD.md Section 23 (project fields)"
      links={[{ label: "Back to Tree Explorer", href: "/explore" }]}
    />
  );
}
