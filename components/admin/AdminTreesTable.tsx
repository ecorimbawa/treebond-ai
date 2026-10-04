"use client";

import { Pencil, Plus, Sprout, Trash2, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import {
  buttonClass,
  cellClass,
  ErrorBanner,
  Field,
  FilterSelect,
  FormPanel,
  mono,
  Pagination,
  Pill,
  rowClass,
  SelectField,
  Table,
  TableCard,
  TableEmpty,
  TableSkeleton,
  Th,
  Thead,
} from "@/components/console/ui";
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

type PaginationState = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const LIMIT = 20;
const COLUMNS = 6;
const STATUS_OPTIONS = Object.entries(TREE_STATUS_LABEL) as [
  TreeStatus,
  string,
][];

function toDateInputValue(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

export function AdminTreesTable() {
  const [trees, setTrees] = useState<AdminTree[]>([]);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
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

  const hasFilters = Boolean(status || projectId || operatorId);

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

  function clearFilters() {
    setStatus("");
    setProjectId("");
    setOperatorId("");
    setSkip(0);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    // Grab the element before awaiting — React nulls currentTarget once the
    // handler yields, so a post-await reset() would throw into the catch.
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const res = await fetch("/api/admin/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create tree");
      formElement.reset();
      setIsCreating(false);
      setSkip(0);
      setReloadToken((t) => t + 1);
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
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {isCreating && (
        <FormPanel
          title="New tree"
          description="Registers the tree in MongoDB only. An operator still has to sign registerTree() before it exists on-chain."
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          submitLabel="Create Tree"
        >
          <SelectField label="Project" name="projectId" required>
            <option value="">Select project…</option>
            {projectOptions.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </SelectField>
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
        </FormPanel>
      )}

      <TableCard
        title="Trees"
        meta={
          pagination
            ? `${pagination.total} tree${pagination.total === 1 ? "" : "s"}${hasFilters ? " matching the current filters" : " across every project"}`
            : "Loading…"
        }
        actions={
          <>
            <FilterSelect
              label="Filter by status"
              value={status}
              onChange={(value) => handleFilterChange(setStatus, value)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Filter by project"
              value={projectId}
              onChange={(value) => handleFilterChange(setProjectId, value)}
            >
              <option value="">All projects</option>
              {projectOptions.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Filter by operator"
              value={operatorId}
              onChange={(value) => handleFilterChange(setOperatorId, value)}
            >
              <option value="">All operators</option>
              {operatorOptions.map((operator) => (
                <option key={operator._id} value={operator._id}>
                  {operator.fullName}
                </option>
              ))}
            </FilterSelect>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-bold text-[#667069] transition hover:text-[#B3402F]"
              >
                <X size={13} aria-hidden="true" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCreating((v) => !v)}
              className={buttonClass(
                isCreating ? "secondary" : "primary",
                "sm",
              )}
            >
              {isCreating ? (
                <X size={14} aria-hidden="true" />
              ) : (
                <Plus size={14} aria-hidden="true" />
              )}
              {isCreating ? "Close form" : "New Tree"}
            </button>
          </>
        }
        footer={
          pagination ? (
            <Pagination
              noun="trees"
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
            <Th>Status</Th>
            <Th>Planted</Th>
            <Th align="right" srOnly>
              Actions
            </Th>
          </Thead>
          {isLoading ? (
            <TableSkeleton columns={COLUMNS} />
          ) : (
            <tbody className="divide-y divide-[#e2e7e2]">
              {trees.length === 0 ? (
                <TableEmpty
                  colSpan={COLUMNS}
                  icon={<Sprout size={20} aria-hidden="true" />}
                  title="No trees found"
                  hint={
                    hasFilters
                      ? "Nothing matches these filters — try clearing one."
                      : "Trees appear here once an operator registers them."
                  }
                />
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
          )}
        </Table>
      </TableCard>
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
      <tr className={isEditing ? "bg-[#FAFAF7]" : rowClass}>
        <td className="px-5 py-4 align-middle">
          <p className={`${mono} text-xs text-[#929A94]`}>{tree.treeCode}</p>
          <Link
            href={`/trees/${tree._id}`}
            className="font-bold text-[#163D2A] transition hover:text-[#246B45]"
          >
            {tree.species}
          </Link>
          {isOnChain && (
            <div className="mt-1.5">
              <Pill tone="chain">TOKEN #{tree.tokenId}</Pill>
            </div>
          )}
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
          {tree.projectId?.createdBy?.fullName ?? (
            <span className="text-[#929A94]">Unknown</span>
          )}
        </td>
        <td className="px-5 py-4 align-middle">
          <TreeStatusPill status={tree.status} />
        </td>
        <td className={cellClass}>
          <p className="font-semibold text-[#18201B]">
            {new Date(tree.plantedAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-[#929A94]">
            {tree.currentHeightCm} cm · from {tree.initialHeightCm} cm
          </p>
        </td>
        <td className="px-5 py-4 text-right align-middle">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={isEditing ? onCancelEdit : onStartEdit}
              className={buttonClass("secondary", "sm")}
            >
              {isEditing ? (
                <X size={13} aria-hidden="true" />
              ) : (
                <Pencil size={13} aria-hidden="true" />
              )}
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
              aria-label={`Delete ${tree.treeCode}`}
              className={buttonClass("danger", "sm")}
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={6} className="bg-[#FAFAF7] px-5 pb-6 pt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSave(new FormData(e.currentTarget));
              }}
              className="rounded-2xl border border-[#e2e7e2] bg-white p-6"
            >
              <p className="text-sm font-extrabold tracking-[-0.02em] text-[#163D2A]">
                Correct field data · {tree.treeCode}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#667069]">
                Status, token ID and owner wallet aren&rsquo;t editable here —
                they&rsquo;re synced from on-chain events only.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              </div>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-[#e2e7e2] pt-5">
                <button
                  type="submit"
                  disabled={isPending}
                  className={buttonClass("primary")}
                >
                  {isPending ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className={buttonClass("secondary")}
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
