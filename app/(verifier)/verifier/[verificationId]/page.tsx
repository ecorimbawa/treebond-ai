// @/app/verifier/[verificationId]/page.tsx
import { notFound } from "next/navigation";
import { VerificationActions } from "@/components/verifier/VerificationActions";
import { connectDB } from "@/lib/db/connection";
import { AiAnalysis, Tree, TreeEvidence, Verification } from "@/models";

export default async function VerifierReviewPage(
  props: PageProps<"/verifier/[verificationId]">,
) {
  const { verificationId } = await props.params;

  await connectDB();
  const evidence = await TreeEvidence.findById(verificationId).lean();
  if (!evidence) notFound();

  const [tree, aiAnalysis, verification] = await Promise.all([
    Tree.findById(evidence.treeId).lean(),
    AiAnalysis.findOne({ evidenceId: evidence._id }).lean(),
    Verification.findOne({ evidenceId: evidence._id }).lean(),
  ]);
  if (!tree || !aiAnalysis) notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        VERIFIER · REVIEW
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        {tree.treeCode} · {tree.species}
      </h1>

      <section className="mt-6 rounded-2xl border border-[#e2e7e2] bg-white p-6">
        <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
          EVIDENCE
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Type" value={evidence.type.replaceAll("_", " ")} />
          <Row label="Image CID" value={evidence.imageCid} />
          <Row
            label="Captured"
            value={new Date(evidence.capturedAt).toLocaleString()}
          />
          <Row
            label="GPS"
            value={`${evidence.latitude.toFixed(5)}, ${evidence.longitude.toFixed(5)}`}
          />
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e2e7e2] bg-white p-6">
        <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
          AI ANALYSIS
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Health score" value={String(aiAnalysis.healthScore)} />
          <Row label="Growth score" value={String(aiAnalysis.growthScore)} />
          <Row
            label="Anomaly risk"
            value={`${aiAnalysis.anomalyRisk} (${aiAnalysis.anomalyRiskScore})`}
          />
          <Row
            label="Model"
            value={`${aiAnalysis.modelName} ${aiAnalysis.modelVersion}`}
          />
        </dl>
        <p className="mt-3 text-sm leading-6 text-[#667069]">
          {aiAnalysis.explanation}
        </p>
      </section>

      <section className="mt-6">
        <VerificationActions
          evidenceId={evidence._id.toString()}
          verification={
            verification
              ? {
                  id: verification._id.toString(),
                  status: verification.status,
                  reason: verification.reason,
                  txHash: verification.txHash,
                }
              : null
          }
        />
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#929A94]">{label}</dt>
      <dd className="font-bold text-[#163D2A]">{value}</dd>
    </div>
  );
}
