"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
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

function toDateInputValue(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

export function AdminTreesTable() {
  const [trees, setTrees] = useState<AdminTree[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [skip, setSkip] = useState(0);
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [operatorOptions, setOperatorOptions] = useState<OperatorOption[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadToken is an intentional refetch trigger, not read in the effect body
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
  }, [skip, status, projectId, operatorId, reloadToken]);

  function handleFilterChange(setter: (value: string) => void, value: string) {
    setter(value);
    setSkip(0);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create tree");
      setIsCreating(false);
      setSkip(0);
      setReloadToken((t) => t + 1);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tree");
    }
  }

  async function handleSave(id: string, form: FormData) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/trees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update tree");
      setTrees((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...json.data } : t)),
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tree");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tree? This cannot be undone.")) return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/trees/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete tree");
      setTrees((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tree");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
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

        <button
          type="button"
          onClick={() => setIsCreating((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
        >
          <Plus size={16} aria-hidden="true" />
          New Tree
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="mb-4 grid gap-3 rounded-2xl border border-[#e2e7e2] bg-white p-5 sm:grid-cols-2"
        >
          <label className="block text-sm" htmlFor="new-tree-project">
            <span className="font-bold text-[#163D2A]">Project</span>
            <select
              id="new-tree-project"
              name="projectId"
              required
              className="mt-1.5 w-full rounded-xl border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
            >
              <option value="">Select project…</option>
              {projectOptions.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Tree code"
            name="treeCode"
            placeholder="TREE-JTG-000192"
            required
          />
          <Field label="Species" name="species" required />
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
          <Field label="Planted at" name="plantedAt" type="date" required />
          <Field
            label="Initial height (cm)"
            name="initialHeightCm"
            type="number"
            required
          />
          <input type="hidden" name="currentHeightCm" value="0" />
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
            >
              Create Tree
            </button>
          </div>
        </form>
      )}

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
            ) : trees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  No trees found
                </td>
              </tr>
            ) : (
              trees.map((tree) => (
                <TreeRows
                  key={tree._id}
                  tree={tree}
                  isEditing={editingId === tree._id}
                  isPending={pendingId === tree._id}
                  onStartEdit={() => setEditingId(tree._id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={(form) => handleSave(tree._id, form)}
                  onDelete={() => handleDelete(tree._id)}
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

function TreeRows({
  tree,
  isEditing,
  isPending,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  tree: AdminTree;
  isEditing: boolean;
  isPending: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (form: FormData) => void;
  onDelete: () => void;
}) {
  const isOnChain = tree.tokenId != null;

  return (
    <>
      <tr>
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
              disabled={isPending || isOnChain}
              title={
                isOnChain
                  ? "Already registered on-chain — can't delete"
                  : undefined
              }
              onClick={onDelete}
              className="text-xs font-bold text-[#B3402F] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
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
                label="Species"
                name="species"
                defaultValue={tree.species}
                required
              />
              <Field
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                defaultValue={String(tree.latitude)}
                required
              />
              <Field
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                defaultValue={String(tree.longitude)}
                required
              />
              <Field
                label="Planted at"
                name="plantedAt"
                type="date"
                defaultValue={toDateInputValue(tree.plantedAt)}
                required
              />
              <Field
                label="Initial height (cm)"
                name="initialHeightCm"
                type="number"
                defaultValue={String(tree.initialHeightCm)}
                required
              />
              <Field
                label="Current height (cm)"
                name="currentHeightCm"
                type="number"
                defaultValue={String(tree.currentHeightCm)}
                required
              />
              <p className="text-xs text-[#929A94] sm:col-span-2">
                Status, token ID, and owner wallet aren't editable here —
                they're synced from on-chain events only.
              </p>
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
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm" htmlFor={name}>
      <span className="font-bold text-[#163D2A]">{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
      />
    </label>
  );
}
