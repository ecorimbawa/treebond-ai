// @/app/(public)/trees/[treeId]/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default async function TreePassportPage(
  props: PageProps<"/trees/[treeId]">,
) {
  const { treeId } = await props.params;

  return (
    <RouteStub
      audience="Public"
      title={`Tree Passport — ${treeId}`}
      route="/trees/[treeId]"
      description="Identity, location, physical status, AI analysis, verification history, and on-chain record for one tree — the main product showcase. This is where a sponsor connects a wallet and sponsors a tree once that flow is wired up."
      prdRef="PRD.md Section 14-15"
      links={[{ label: "Back to Tree Explorer", href: "/explore" }]}
    />
  );
}
