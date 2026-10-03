// @/app/operator/trees/[treeId]/evidence/new/page.tsx
import { notFound } from "next/navigation";
import { EvidenceForm } from "@/components/operator/EvidenceForm";
import { connectDB } from "@/lib/db/connection";
import { Tree } from "@/models";

export default async function OperatorUploadEvidencePage(
  props: PageProps<"/operator/trees/[treeId]/evidence/new">,
) {
  const { treeId } = await props.params;

  await connectDB();
  const tree = await Tree.findById(treeId).lean();
  if (!tree) notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        OPERATOR · UPLOAD EVIDENCE
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Upload Evidence — {tree.treeCode}
      </h1>
      <p className="mt-2 text-sm text-[#667069]">
        No IPFS/AI pipeline is wired up yet — image CID and analysis scores are
        entered manually below and enter the verifier's queue as-is.
      </p>

      <EvidenceForm mongoTreeId={tree._id.toString()} />
    </main>
  );
}
