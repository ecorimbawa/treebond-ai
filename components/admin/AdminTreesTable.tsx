"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TreeStatusPill } from "@/components/tree/TreeStatusPill";
import { TREE_STATUS_LABEL } from "@/lib/tree-status";
import type { ITree, TreeStatus } from "@/models";

type AdminTreeProject = {
  _id: string;
  name: string;
  createdBy: { _id: string; fullName: string; email: string } | null;
};

type AdminTree = Omit<ITree, "projectId"> & {
  _id: string;
  projectId: AdminTreeProject | null;
};

type ProjectOption = { _id: string; name: string };
type OperatorOption = { _id: string; fullName: string };

type Pagination = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const LIMIT = 20;
const STATUS_OPTIONS = Object.entries(TREE_STATUS_LABEL) as [
  TreeStatus,
  string,
][];

export function AdminTreesTable() {
  const [trees, setTrees] = useState<AdminTree[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [skip, setSkip] = useState(0);
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [operatorOptions, setOperatorOptions] = useState<OperatorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/projects?limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProjectOptions(json.data);
      });
    fetch("/api/admin/users?role=operator&limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setOperatorOptions(json.data);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams({
      limit: String(LIMIT),
      skip: String(skip),
    });
    if (status) params.set("status", status);
    if (projectId) params.set("projectId", projectId);
    if (operatorId) params.set("operatorId", operatorId);

    fetch(`/api/admin/trees?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setTrees(json.data);
          setPagination(json.pagination);
        } else {
          setError(json.error ?? "Failed to load trees");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load trees");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skip, status, projectId, operatorId]);

  function handleFilterChange(setter: (value: string) => void, value: string) {
    setter(value);
    setSkip(0);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => handleFilterChange(setStatus, e.target.value)}
          className="rounded-lg border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={projectId}
          onChange={(e) => handleFilterChange(setProjectId, e.target.value)}
          className="rounded-lg border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        >
          <option value="">All projects</option>
          {projectOptions.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={operatorId}
          onChange={(e) => handleFilterChange(setOperatorId, e.target.value)}
          className="rounded-lg border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        >
          <option value="">All operators</option>
          {operatorOptions.map((operator) => (
            <option key={operator._id} value={operator._id}>
              {operator.fullName}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-[#B3402F]">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e2e7e2] bg-[#FAFAF7]">
            <tr>
              <th className="px-5 py-3 font-bold text-[#929A94]">Tree</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Project</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Operator</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Status</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Planted</th>
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
                  No trees found
                </td>
              </tr>
            ) : (
              trees.map((tree) => (
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
                  <td className="px-5 py-3">
                    <TreeStatusPill status={tree.status} />
                  </td>
                  <td className="px-5 py-3 text-[#667069]">
                    {new Date(tree.plantedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-[#929A94]">
            {pagination.total === 0
              ? "0 trees"
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
