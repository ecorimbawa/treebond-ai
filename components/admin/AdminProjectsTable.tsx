"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { IProject } from "@/models";

type AdminProject = Omit<IProject, "createdBy"> & {
  _id: string;
  createdBy: { _id: string; fullName: string; email: string } | null;
};

type Pagination = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const LIMIT = 20;

export function AdminProjectsTable() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/admin/projects?limit=${LIMIT}&skip=${skip}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setProjects(json.data);
          setPagination(json.pagination);
        } else {
          setError(json.error ?? "Failed to load projects");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load projects");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skip]);

  return (
    <div>
      {error && <p className="mb-3 text-sm text-[#B3402F]">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e2e7e2] bg-[#FAFAF7]">
            <tr>
              <th className="px-5 py-3 font-bold text-[#929A94]">Project</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Location</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Operator</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Target</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Status</th>
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
            ) : projects.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project._id}>
                  <td className="px-5 py-3">
                    <Link
                      href={`/projects/${project._id}`}
                      className="font-bold text-[#163D2A] hover:text-[#246B45] hover:underline"
                    >
                      {project.name}
                    </Link>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                          project.onChainProjectId != null
                            ? "bg-[#DDEEE3] text-[#246B45]"
                            : "bg-[#FBEFD9] text-[#B7791F]"
                        }`}
                      >
                        {project.onChainProjectId != null
                          ? `ON-CHAIN #${project.onChainProjectId}`
                          : "NOT ON-CHAIN"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#667069]">
                    {project.regency}, {project.province}
                  </td>
                  <td className="px-5 py-3 text-[#667069]">
                    {project.createdBy ? (
                      <>
                        <p className="font-bold text-[#163D2A]">
                          {project.createdBy.fullName}
                        </p>
                        <p>{project.createdBy.email}</p>
                      </>
                    ) : (
                      "Unknown"
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#667069]">
                    {project.targetTreeCount}
                  </td>
                  <td className="px-5 py-3 text-[#667069] capitalize">
                    {project.status}
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
              ? "0 projects"
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
