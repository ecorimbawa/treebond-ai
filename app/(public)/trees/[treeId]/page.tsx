import { ArrowLeft, Sprout } from "lucide-react";
import type { Types } from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { TreePassportChainPanel } from "@/components/tree/TreePassportChainPanel";
import { connectDB } from "@/lib/db/connection";
import { TREE_STATUS_LABEL } from "@/lib/tree-status";
import { Tree, TreeEvidence, Verification } from "@/models";
import type { IProject } from "@/models/Project";
import type { ITree } from "@/models/Tree";

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

    return { tree, evidence, verifications };
  } catch {
    return null;
  }
}

export default async function TreePassportPage(
  props: PageProps<"/trees/[treeId]">,
) {
  const { treeId } = await props.params;
  const data = await getTreePassport(treeId);
  if (!data) notFound();

  const { tree, evidence, verifications } = data;
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
                    className="flex items-center justify-between border-b border-[#f1f3f1] pb-3 text-sm last:border-0"
                  >
                    <span className="font-bold text-[#163D2A]">
                      Score {v.verificationScore} · {v.decision}
                    </span>
                    <span className="text-[#929A94]">{v.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside>
          <TreePassportChainPanel
            mongoTreeId={tree._id.toString()}
            tokenId={tree.tokenId ?? null}
          />
        </aside>
      </section>
    </main>
  );
}
