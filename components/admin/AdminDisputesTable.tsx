"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

type Pagination = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const LIMIT = 20;
const RESOLVE_OPTIONS = (Object.keys(TREE_STATUS_LABEL) as TreeStatus[]).filter(
  (status) => status !== "DRAFT" && status !== "DISPUTED",
);

export function AdminDisputesTable() {
  const [trees, setTrees] = useState<DisputedTree[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
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
      {error && <p className="mb-3 text-sm text-[#B3402F]">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e2e7e2] bg-[#FAFAF7]">
            <tr>
              <th className="px-5 py-3 font-bold text-[#929A94]">Tree</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Project</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Operator</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">
                Last Updated
              </th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Resolve to</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e7e2]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  Loading…
                </td>
              </tr>
            ) : trees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  No disputed trees — queue is empty
                </td>
              </tr>
            ) : (
              trees.map((tree) => {
                const isPending = pendingId === tree._id;
                return (
                  <tr key={tree._id}>
                    <td className="px-5 py-3">
                      <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#929A94]">
                        {tree.treeCode}
                      </p>
                      <Link
                        href={`/trees/${tree._id}`}
                        className="font-bold text-[#163D2A] hover:text-[#246B45] hover:underline"
                      >
                        {tree.species}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#667069]">
                      {tree.projectId ? (
                        <Link
                          href={`/projects/${tree.projectId._id}`}
                          className="font-bold text-[#246B45] hover:text-[#163D2A] hover:underline"
                        >
                          {tree.projectId.name}
                        </Link>
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#667069]">
                      {tree.projectId?.createdBy?.fullName ?? "Unknown"}
                    </td>
                    <td className="px-5 py-3 text-[#667069]">
                      {new Date(tree.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value=""
                        disabled={isPending}
                        onChange={(e) => {
                          const value = e.target.value as TreeStatus | "";
                          if (value) handleResolve(tree._id, value);
                        }}
                        className="rounded-lg border border-[#d9e2da] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#246B45] disabled:cursor-not-allowed disabled:opacity-50"
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
                      <p className="mt-1 text-[11px] text-[#929A94]">
                        Mongo-only — on-chain stays DISPUTED
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-[#929A94]">
            {pagination.total === 0
              ? "0 disputes"
              : `${skip + 1}–${Math.min(skip + LIMIT, pagination.total)} of ${pagination.total}`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSkip((s) => Math.max(0, s - LIMIT))}
              disabled={skip === 0}
              className="rounded-lg border border-[#d9e2da] px-3 py-1.5 font-bold text-[#163D2A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setSkip((s) => s + LIMIT)}
              disabled={!pagination.hasMore}
              className="rounded-lg border border-[#d9e2da] px-3 py-1.5 font-bold text-[#163D2A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
