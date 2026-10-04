"use client";

import { ArrowUpRight, Blocks } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  cellClass,
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
import type { IProject } from "@/models";

type AdminProject = Omit<IProject, "createdBy"> & {
  _id: string;
  createdBy: { _id: string; fullName: string; email: string } | null;
};

type PaginationState = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const LIMIT = 20;
const COLUMNS = 6;

const STATUS_TONE = {
  active: "good",
  paused: "warn",
  completed: "chain",
  archived: "muted",
} as const;

// Read-only by design: project creation needs a real createProject() tx on
// TreeRegistry (see /operator/projects/new), which this panel never did —
// anything created here would be permanently stuck "NOT ON-CHAIN". Admin's
// job for projects is oversight, not authoring.
export function AdminProjectsTable() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
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
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <TableCard
        title="Projects"
        meta={
          pagination
            ? `${pagination.total} registered across all operators`
            : "Loading…"
        }
        actions={<Pill tone="muted">READ-ONLY</Pill>}
        footer={
          pagination ? (
            <Pagination
              noun="projects"
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
            <Th>Project</Th>
            <Th>Location</Th>
            <Th>Operator</Th>
            <Th>Target</Th>
            <Th>Status</Th>
            <Th align="right" srOnly>
              Actions
            </Th>
          </Thead>
          {isLoading ? (
            <TableSkeleton columns={COLUMNS} />
          ) : (
            <tbody className="divide-y divide-[#e2e7e2]">
              {projects.length === 0 ? (
                <TableEmpty
                  colSpan={COLUMNS}
                  icon={<Blocks size={20} aria-hidden="true" />}
                  title="No projects found"
                  hint="Projects appear here once an operator registers one on-chain."
                />
              ) : (
                projects.map((project) => (
                  <tr key={project._id} className={rowClass}>
                    <td className="px-5 py-4 align-middle">
                      <Link
                        href={`/projects/${project._id}`}
                        className="font-bold text-[#163D2A] transition hover:text-[#246B45]"
                      >
                        {project.name}
                      </Link>
                      <div className="mt-1.5">
                        {project.onChainProjectId != null ? (
                          <Pill tone="chain">
                            ON-CHAIN #{project.onChainProjectId}
                          </Pill>
                        ) : (
                          <Pill tone="warn">NOT ON-CHAIN</Pill>
                        )}
                      </div>
                    </td>
                    <td className={cellClass}>
                      <p className="font-semibold text-[#18201B]">
                        {project.regency}
                      </p>
                      <p className="text-xs text-[#929A94]">
                        {project.province}, {project.country}
                      </p>
                    </td>
                    <td className={cellClass}>
                      {project.createdBy ? (
                        <>
                          <p className="font-semibold text-[#18201B]">
                            {project.createdBy.fullName}
                          </p>
                          <p className="text-xs text-[#929A94]">
                            {project.createdBy.email}
                          </p>
                        </>
                      ) : (
                        <span className="text-[#929A94]">Unknown</span>
                      )}
                    </td>
                    <td className={cellClass}>
                      <p className={`${mono} font-semibold text-[#18201B]`}>
                        {project.targetTreeCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#929A94]">
                        {project.areaHectares} ha
                      </p>
                    </td>
                    <td className={cellClass}>
                      <Pill tone={STATUS_TONE[project.status]}>
                        {project.status.toUpperCase()}
                      </Pill>
                    </td>
                    <td className="px-5 py-4 text-right align-middle">
                      <Link
                        href={`/projects/${project._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#246B45] transition hover:text-[#163D2A]"
                      >
                        Open
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </Table>
      </TableCard>
    </div>
  );
}
