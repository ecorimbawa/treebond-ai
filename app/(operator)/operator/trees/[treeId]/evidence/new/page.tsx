// @/app/operator/trees/[treeId]/evidence/new/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default async function OperatorUploadEvidencePage(
  props: PageProps<"/operator/trees/[treeId]/evidence/new">,
) {
  const { treeId } = await props.params;

  return (
    <RouteStub
      audience="Operator"
      title={`Upload Evidence — ${treeId}`}
      route="/operator/trees/[treeId]/evidence/new"
      description="Upload a monitoring photo and GPS reading for this tree. Submitting triggers the AI analysis pipeline (tree detection, health score, growth score, anomaly risk) before it enters the verifier's queue."
      prdRef="PRD.md Section 25, 31-33"
      links={[{ label: "Operator Dashboard", href: "/operator" }]}
    />
  );
}
