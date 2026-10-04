import { ArrowLeft, ArrowUpRight, Cpu, Sprout } from "lucide-react";
import type { Types } from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { OperatorToolsPanel } from "@/components/operator/OperatorToolsPanel";
import { TreePassportChainPanel } from "@/components/tree/TreePassportChainPanel";
import { connectDB } from "@/lib/db/connection";
import { TREE_STATUS_LABEL } from "@/lib/tree-status";
import { AiAnalysis, Tree, TreeEvidence, Verification } from "@/models";
import type { IAiAnalysis } from "@/models/AiAnalysis";
import type { IProject } from "@/models/Project";
import type { ITree } from "@/models/Tree";

const ARBISCAN_TX = "https://sepolia.arbiscan.io/tx/";

const ANOMALY_TONE = {
  LOW: "bg-[#DDEEE3] text-[#246B45]",
  MEDIUM: "bg-[#FBEFD9] text-[#B7791F]",
  HIGH: "bg-[#F7E1DE] text-[#B3402F]",
} as const;

// Mongoose's populate()+lean() generics don't disambiguate single-doc vs array
// results well; cast once to the shape we know this query returns instead of
// threading a generic through the query builder.
type TreePassportDoc = Omit<ITree, "projectId"> & {
  _id: Types.ObjectId;
  projectId: IProject | null;
};

async function getTreePassport(id: string) {
  try {
    await connectDB();
    const tree = (await Tree.findById(id)
      .populate("projectId")
      .lean()) as TreePassportDoc | null;
    if (!tree) return null;

    const [evidence, verifications] = await Promise.all([
      TreeEvidence.find({ treeId: tree._id }).sort({ capturedAt: -1 }).lean(),
      Verification.find({ treeId: tree._id }).sort({ createdAt: -1 }).lean(),
    ]);

    // Sponsors shouldn't have to wait for a verifier to push a record on-chain
    // before they can see what the AI found — read the latest analysis
    // straight off the newest evidence instead (PRD §97's 3:00 demo beat).
    const latestAi = evidence.length
      ? ((await AiAnalysis.findOne({
          evidenceId: { $in: evidence.map((e) => e._id) },
        })
          .sort({ createdAt: -1 })
          .lean()) as IAiAnalysis | null)
      : null;

    return { tree, evidence, verifications, latestAi };
  } catch {
    return null;
  }
}

function ScoreBlock({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#929A94]">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        {value}
        <span className="text-sm font-bold text-[#929A94]"> / 100</span>
      </dd>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F3F5F1]"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-[#246B45]"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export default async function TreePassportPage(
  props: PageProps<"/trees/[treeId]">,
) {
  const { treeId } = await props.params;
  const data = await getTreePassport(treeId);
  if (!data) notFound();

  const { tree, evidence, verifications, latestAi } = data;
  const project = tree.projectId;

  return (
    <main className="min-h-dvh bg-[#FAFAF7] text-[#18201B]">
      <header className="sticky top-0 z-40 border-b border-[#e2e7e2] bg-[#FAFAF7]/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#667069] transition hover:text-[#163D2A]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Explorer
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1280px] gap-8 px-5 py-12 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#929A94]">
            {tree.treeCode}
          </p>
          <h1 className="mt-2 text-balance text-4xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
            {tree.species}
          </h1>
          <p className="mt-2 text-base text-[#667069]">
            {project ? (
              <Link
                href={`/projects/${project._id}`}
                className="font-bold text-[#246B45] hover:text-[#163D2A] hover:underline"
              >
                {project.name}
              </Link>
            ) : (
              "Unassigned project"
            )}
            {project && ` · ${project.regency}, ${project.province}`}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#DDEEE3] px-2.5 py-1 text-[10px] font-extrabold text-[#246B45]">
            {TREE_STATUS_LABEL[tree.status]}
          </span>

          {tree.metadataCid && (
            // biome-ignore lint/performance/noImgElement: tree.metadataCid is an operator-controlled external gateway URL, not a local/optimizable asset
            <img
              src={tree.metadataCid}
              alt={`${tree.species} — ${tree.treeCode}`}
              className="mt-6 h-64 w-full rounded-2xl border border-[#e2e7e2] object-cover"
            />
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-[#e2e7e2] bg-white p-6">
              <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
                PHYSICAL
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#929A94]">Planted</dt>
                  <dd className="font-bold text-[#163D2A]">
                    {new Date(tree.plantedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#929A94]">Initial height</dt>
                  <dd className="font-bold text-[#163D2A]">
                    {tree.initialHeightCm} cm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#929A94]">Current height</dt>
                  <dd className="font-bold text-[#163D2A]">
                    {tree.currentHeightCm} cm
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-[#e2e7e2] bg-white p-6">
              <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
                LOCATION
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#929A94]">Latitude</dt>
                  <dd className="font-bold text-[#163D2A]">
                    {tree.latitude.toFixed(5)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#929A94]">Longitude</dt>
                  <dd className="font-bold text-[#163D2A]">
                    {tree.longitude.toFixed(5)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {latestAi && (
            <section className="mt-6 rounded-2xl border border-[#e2e7e2] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
                  AI ANALYSIS
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${ANOMALY_TONE[latestAi.anomalyRisk]}`}
                >
                  <span
                    className="size-1.5 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  {latestAi.anomalyRisk} ANOMALY RISK
                </span>
              </div>

              <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                <ScoreBlock label="Health" value={latestAi.healthScore} />
                <ScoreBlock label="Growth" value={latestAi.growthScore} />
                <ScoreBlock
                  label="Tree detection"
                  value={Math.round(latestAi.treeConfidence * 100)}
                />
              </dl>

              {latestAi.explanation && (
                <p className="mt-4 border-t border-[#f1f3f1] pt-4 text-sm leading-6 text-[#667069]">
                  {latestAi.explanation}
                </p>
              )}

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#929A94]">
                <Cpu size={12} aria-hidden="true" />
                {latestAi.modelName} {latestAi.modelVersion} · AI assists
                verification, a human verifier still signs off before anything
                goes on-chain.
              </p>
            </section>
          )}

          <section className="mt-6 rounded-2xl border border-[#e2e7e2] bg-white p-6">
            <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
              MONITORING EVIDENCE
            </p>
            {evidence.length === 0 ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-[#929A94]">
                <Sprout size={16} aria-hidden="true" />
                No evidence submitted yet.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {evidence.map((item) => (
                  <li
                    key={item._id.toString()}
                    className="flex items-center justify-between border-b border-[#f1f3f1] pb-3 text-sm last:border-0"
                  >
                    <span className="font-bold text-[#163D2A]">
                      {item.type.replaceAll("_", " ")}
                    </span>
                    <span className="text-[#929A94]">
                      {new Date(item.capturedAt).toLocaleDateString()} ·{" "}
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-[#e2e7e2] bg-white p-6">
            <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
              VERIFICATION HISTORY
            </p>
            {verifications.length === 0 ? (
              <p className="mt-4 text-sm text-[#929A94]">
                No verification records yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {verifications.map((v) => (
                  <li
                    key={v._id.toString()}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f1f3f1] pb-3 text-sm last:border-0"
                  >
                    <span className="font-bold text-[#163D2A]">
                      Score {v.verificationScore} · {v.decision}
                    </span>
                    {/* The on-chain proof is the whole point of the passport —
                        link it where sponsors actually read the history. */}
                    {v.txHash ? (
                      <a
                        href={`${ARBISCAN_TX}${v.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-sm font-bold text-[#3154D5] transition hover:text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
                      >
                        View transaction
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-[#929A94]">{v.status}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside>
          {tree.tokenId != null && (
            <OperatorToolsPanel
              mongoTreeId={tree._id.toString()}
              tokenId={tree.tokenId}
            />
          )}
          <TreePassportChainPanel
            mongoTreeId={tree._id.toString()}
            tokenId={tree.tokenId ?? null}
          />
        </aside>
      </section>
    </main>
  );
}
