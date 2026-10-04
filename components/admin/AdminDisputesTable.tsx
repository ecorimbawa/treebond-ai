"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  cellClass,
  controlClass,
  ErrorBanner,
  mono,
  Pagination,
  Pill,
  rowClass,
  Table,
  TableCard,
  TableEmpty,
  TableSkeleton,
  Th,
  Thead,
} from "@/components/admin/ui";
import { TREE_STATUS_LABEL } from "@/lib/tree-status";
import type { ITree, TreeStatus } from "@/models";

type DisputedTreeProject = {
  _id: string;
  name: string;
  createdBy: { _id: string; fullName: string; email: string } | null;
};

type DisputedTree = Omit<ITree, "projectId"> & {
  _id: string;
  projectId: DisputedTreeProject | null;
};

type PaginationState = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const LIMIT = 20;
const COLUMNS = 5;
const RESOLVE_OPTIONS = (Object.keys(TREE_STATUS_LABEL) as TreeStatus[]).filter(
  (status) => status !== "DRAFT" && status !== "DISPUTED",
);

export function AdminDisputesTable() {
  const [trees, setTrees] = useState<DisputedTree[]>([]);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/admin/disputes?limit=${LIMIT}&skip=${skip}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setTrees(json.data);
          setPagination(json.pagination);
        } else {
          setError(json.error ?? "Failed to load disputes");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load disputes");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skip]);

  async function handleResolve(treeId: string, newStatus: TreeStatus) {
    setPendingId(treeId);
    setError(null);
    try {
      const res = await fetch(`/api/trees/${treeId}/resolve-dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error ?? "Failed to resolve dispute");
      }
      setTrees((prev) => prev.filter((t) => t._id !== treeId));
      setPagination((prev) =>
        prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve dispute",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <TableCard
        title="Disputed trees"
        meta={
          pagination
            ? pagination.total === 0
              ? "Queue is empty"
              : `${pagination.total} waiting on a decision`
            : "Loading…"
        }
        actions={
          pagination && pagination.total > 0 ? (
            <Pill tone="bad">NEEDS REVIEW</Pill>
          ) : (
            <Pill tone="good">CLEAR</Pill>
          )
        }
        footer={
          pagination ? (
            <Pagination
              noun="disputes"
              skip={skip}
              limit={LIMIT}
              total={pagination.total}
              hasMore={pagination.hasMore}
              onPrev={() => setSkip((s) => Math.max(0, s - LIMIT))}
              onNext={() => setSkip((s) => s + LIMIT)}
            />
          ) : undefined
        }
      >
        <Table>
          <Thead>
            <Th>Tree</Th>
            <Th>Project</Th>
            <Th>Operator</Th>
            <Th>Last updated</Th>
            <Th align="right">Resolve to</Th>
          </Thead>
          {isLoading ? (
            <TableSkeleton columns={COLUMNS} />
          ) : (
            <tbody className="divide-y divide-[#e2e7e2]">
              {trees.length === 0 ? (
                <TableEmpty
                  colSpan={COLUMNS}
                  icon={<ShieldCheck size={20} aria-hidden="true" />}
                  title="No disputed trees"
                  hint="Nothing is waiting on an admin decision right now."
                />
              ) : (
                trees.map((tree) => {
                  const isPending = pendingId === tree._id;
                  return (
                    <tr key={tree._id} className={rowClass}>
                      <td className="px-5 py-4 align-middle">
                        <p className={`${mono} text-xs text-[#929A94]`}>
                          {tree.treeCode}
                        </p>
                        <Link
                          href={`/trees/${tree._id}`}
                          className="font-bold text-[#163D2A] transition hover:text-[#246B45]"
                        >
                          {tree.species}
                        </Link>
                        <div className="mt-1.5">
                          <Pill tone="bad">DISPUTED</Pill>
                        </div>
                      </td>
                      <td className={cellClass}>
                        {tree.projectId ? (
                          <Link
                            href={`/projects/${tree.projectId._id}`}
                            className="font-semibold text-[#246B45] transition hover:text-[#163D2A]"
                          >
                            {tree.projectId.name}
                          </Link>
                        ) : (
                          <span className="text-[#929A94]">Unknown</span>
                        )}
                      </td>
                      <td className={cellClass}>
                        <p className="font-semibold text-[#18201B]">
                          {tree.projectId?.createdBy?.fullName ?? "Unknown"}
                        </p>
                        {tree.projectId?.createdBy?.email && (
                          <p className="text-xs text-[#929A94]">
                            {tree.projectId.createdBy.email}
                          </p>
                        )}
                      </td>
                      <td className={cellClass}>
                        {new Date(tree.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-col items-end gap-1">
                          <select
                            value=""
                            aria-label={`Resolve ${tree.treeCode} to a new status`}
                            disabled={isPending}
                            onChange={(e) => {
                              const value = e.target.value as TreeStatus | "";
                              if (value) handleResolve(tree._id, value);
                            }}
                            className={`${controlClass("sm")} max-w-[200px]`}
                          >
                            <option value="">
                              {isPending ? "Resolving…" : "Resolve to…"}
                            </option>
                            {RESOLVE_OPTIONS.map((statusOption) => (
                              <option key={statusOption} value={statusOption}>
                                {TREE_STATUS_LABEL[statusOption]}
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-[#929A94]">
                            Mongo-only — on-chain stays DISPUTED
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          )}
        </Table>
      </TableCard>
    </div>
  );
}
