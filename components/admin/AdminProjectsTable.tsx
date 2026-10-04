"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import type { IProject } from "@/models";

type AdminProject = Omit<IProject, "createdBy"> & {
  _id: string;
  createdBy: { _id: string; fullName: string; email: string } | null;
};

type OperatorOption = { _id: string; fullName: string; email: string };

type Pagination = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const STATUSES = ["active", "paused", "completed", "archived"] as const;
const LIMIT = 20;

export function AdminProjectsTable() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [operators, setOperators] = useState<OperatorOption[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [skip, setSkip] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users?role=operator&limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setOperators(json.data);
      });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadToken is an intentional refetch trigger, not read in the effect body
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
  }, [skip, reloadToken]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error ?? "Failed to create project");
      setIsCreating(false);
      setSkip(0);
      setReloadToken((t) => t + 1);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  async function handleSave(id: string, form: FormData) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error ?? "Failed to update project");
      setProjects((prev) => prev.map((p) => (p._id === id ? json.data : p)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error ?? "Failed to delete project");
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsCreating((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
        >
          <Plus size={16} aria-hidden="true" />
          New Project
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="mb-4 grid gap-3 rounded-2xl border border-[#e2e7e2] bg-white p-5 sm:grid-cols-2"
        >
          <Field label="Name" name="name" required />
          <Field label="Slug" name="slug" required />
          <div className="sm:col-span-2">
            <Field label="Description" name="description" textarea required />
          </div>
          <Field
            label="Country"
            name="country"
            defaultValue="Indonesia"
            required
          />
          <Field label="Province" name="province" required />
          <Field label="Regency" name="regency" required />
          <Field label="Village" name="village" required />
          <Field
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            required
          />
          <Field
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            required
          />
          <Field
            label="Area (ha)"
            name="areaHectares"
            type="number"
            step="any"
            required
          />
          <Field
            label="Target trees"
            name="targetTreeCount"
            type="number"
            required
          />
          <label className="block text-sm" htmlFor="new-project-operator">
            <span className="font-bold text-[#163D2A]">Operator</span>
            <select
              id="new-project-operator"
              name="createdBy"
              required
              className="mt-1.5 w-full rounded-xl border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
            >
              <option value="">Select operator…</option>
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.fullName} ({op.email})
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

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
              <th className="px-5 py-3 font-bold text-[#929A94]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e7e2]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  Loading…
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <ProjectRows
                  key={project._id}
                  project={project}
                  isEditing={editingId === project._id}
                  isPending={pendingId === project._id}
                  onStartEdit={() => setEditingId(project._id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={(form) => handleSave(project._id, form)}
                  onDelete={() => handleDelete(project._id)}
                />
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

function ProjectRows({
  project,
  isEditing,
  isPending,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  project: AdminProject;
  isEditing: boolean;
  isPending: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (form: FormData) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr>
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
        <td className="px-5 py-3 text-[#667069]">{project.targetTreeCount}</td>
        <td className="px-5 py-3 text-[#667069] capitalize">
          {project.status}
        </td>
        <td className="px-5 py-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={isEditing ? onCancelEdit : onStartEdit}
              className="text-xs font-bold text-[#246B45] hover:underline"
            >
              {isEditing ? "Close" : "Edit"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={onDelete}
              className="text-xs font-bold text-[#B3402F] hover:underline disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={6} className="bg-[#FAFAF7] px-5 py-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSave(new FormData(e.currentTarget));
              }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <Field
                label="Name"
                name="name"
                defaultValue={project.name}
                required
              />
              <Field
                label="Description"
                name="description"
                defaultValue={project.description}
                textarea
                required
              />
              <Field
                label="Country"
                name="country"
                defaultValue={project.country}
                required
              />
              <Field
                label="Province"
                name="province"
                defaultValue={project.province}
                required
              />
              <Field
                label="Regency"
                name="regency"
                defaultValue={project.regency}
                required
              />
              <Field
                label="Village"
                name="village"
                defaultValue={project.village}
                required
              />
              <Field
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                defaultValue={String(project.latitude)}
                required
              />
              <Field
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                defaultValue={String(project.longitude)}
                required
              />
              <Field
                label="Area (ha)"
                name="areaHectares"
                type="number"
                step="any"
                defaultValue={String(project.areaHectares)}
                required
              />
              <Field
                label="Target trees"
                name="targetTreeCount"
                type="number"
                defaultValue={String(project.targetTreeCount)}
                required
              />
              <label
                className="block text-sm"
                htmlFor={`status-${project._id}`}
              >
                <span className="font-bold text-[#163D2A]">Status</span>
                <select
                  id={`status-${project._id}`}
                  name="status"
                  defaultValue={project.status}
                  className="mt-1.5 w-full rounded-xl border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end gap-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="inline-flex h-10 items-center rounded-xl border border-[#d9e2da] px-4 text-sm font-bold text-[#163D2A]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  step,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block text-sm" htmlFor={name}>
      <span className="font-bold text-[#163D2A]">{label}</span>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          step={step}
          required={required}
          defaultValue={defaultValue}
          className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
        />
      )}
    </label>
  );
}
