"use client";

import { Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import {
  buttonClass,
  cellClass,
  controlClass,
  ErrorBanner,
  Field,
  FilterSelect,
  FormPanel,
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
import type { UserRole } from "@/models";

type AdminUser = {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
};

type PaginationState = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const ROLES: UserRole[] = ["sponsor", "operator", "verifier", "admin"];
const LIMIT = 20;
const COLUMNS = 5;

export function AdminUsersTable({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [skip, setSkip] = useState(0);
  const [role, setRole] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadToken is an intentional refetch trigger, not read in the effect body
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams({
      limit: String(LIMIT),
      skip: String(skip),
    });
    if (role) params.set("role", role);

    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setUsers(json.data);
          setPagination(json.pagination);
        } else {
          setError(json.error ?? "Failed to load users");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skip, role, reloadToken]);

  async function handleRoleChange(id: string, nextRole: UserRole) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error ?? "Failed to update role");
      }
      setUsers((prev) => prev.map((u) => (u._id === id ? json.data : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setPendingId(null);
    }
  }

  async function handleSaveProfile(
    id: string,
    fullName: string,
    email: string,
  ) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update user");
      setUsers((prev) => prev.map((u) => (u._id === id ? json.data : u)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setPendingId(null);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    // Grab the element before awaiting — React nulls currentTarget once the
    // handler yields, so a post-await reset() would throw into the catch.
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          fullName: form.get("fullName"),
          role: form.get("role"),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create user");
      formElement.reset();
      setIsCreating(false);
      setSkip(0);
      setReloadToken((t) => t + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  }

  return (
    <div>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {isCreating && (
        <FormPanel
          title="New user"
          description="Creates a MongoDB account straight away — no email verification, no invite flow."
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          submitLabel="Create User"
        >
          <Field label="Full name" name="fullName" required />
          <Field label="Email" name="email" type="email" required />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            hint="They can't change this themselves yet"
          />
          <SelectField label="Role" name="role" defaultValue="sponsor">
            {ROLES.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </SelectField>
        </FormPanel>
      )}

      <TableCard
        title="Accounts"
        meta={
          pagination
            ? `${pagination.total} account${pagination.total === 1 ? "" : "s"}${role ? ` with role ${role}` : " across all roles"}`
            : "Loading…"
        }
        actions={
          <>
            <FilterSelect
              label="Filter by role"
              value={role}
              onChange={(value) => {
                setRole(value);
                setSkip(0);
              }}
            >
              <option value="">All roles</option>
              {ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </FilterSelect>
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
              {isCreating ? "Close form" : "New User"}
            </button>
          </>
        }
        footer={
          pagination ? (
            <Pagination
              noun="users"
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
            <Th>Member</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Joined</Th>
            <Th align="right" srOnly>
              Actions
            </Th>
          </Thead>
          {isLoading ? (
            <TableSkeleton columns={COLUMNS} />
          ) : (
            <tbody className="divide-y divide-[#e2e7e2]">
              {users.length === 0 ? (
                <TableEmpty
                  colSpan={COLUMNS}
                  icon={<Users size={20} aria-hidden="true" />}
                  title="No users found"
                  hint={
                    role
                      ? `Nobody currently holds the ${role} role.`
                      : "Create the first account to get started."
                  }
                />
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    isSelf={user._id === currentUserId}
                    isEditing={editingId === user._id}
                    isPending={pendingId === user._id}
                    onRoleChange={(nextRole) =>
                      handleRoleChange(user._id, nextRole)
                    }
                    onStartEdit={() => setEditingId(user._id)}
                    onCancelEdit={() => setEditingId(null)}
                    onSave={(fullName, email) =>
                      handleSaveProfile(user._id, fullName, email)
                    }
                    onDelete={() => handleDelete(user._id)}
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

function UserRow({
  user,
  isSelf,
  isEditing,
  isPending,
  onRoleChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  user: AdminUser;
  isSelf: boolean;
  isEditing: boolean;
  isPending: boolean;
  onRoleChange: (role: UserRole) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (fullName: string, email: string) => void;
  onDelete: () => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (isEditing) {
    return (
      <tr className="bg-[#FAFAF7]">
        <td className="px-5 py-4 align-middle">
          <Field label="Full name" value={fullName} onChange={setFullName} />
        </td>
        <td className="px-5 py-4 align-middle">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
        </td>
        <td className={cellClass}>
          <Pill tone="muted">{user.role.toUpperCase()}</Pill>
        </td>
        <td className={cellClass}>{joined}</td>
        <td className="px-5 py-4 text-right align-middle">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onSave(fullName, email)}
              className={buttonClass("primary", "sm")}
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className={buttonClass("secondary", "sm")}
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={rowClass}>
      <td className="px-5 py-4 align-middle">
        <div className="flex items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#DDEEE3] text-xs font-extrabold text-[#246B45]"
            aria-hidden="true"
          >
            {user.fullName.trim().charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-bold text-[#163D2A]">{user.fullName}</p>
            {isSelf && (
              <p className="text-[11px] font-bold text-[#929A94]">
                That&rsquo;s you
              </p>
            )}
          </div>
        </div>
      </td>
      <td className={cellClass}>{user.email}</td>
      <td className="px-5 py-4 align-middle">
        <select
          value={user.role}
          aria-label={`Role for ${user.fullName}`}
          disabled={isSelf || isPending}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className={controlClass("sm", "auto")}
          title={
            isSelf ? "You can't change your own role" : "Updates MongoDB only"
          }
        >
          {ROLES.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
            </option>
          ))}
        </select>
      </td>
      <td className={cellClass}>{joined}</td>
      <td className="px-5 py-4 text-right align-middle">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onStartEdit}
            className={buttonClass("secondary", "sm")}
          >
            <Pencil size={13} aria-hidden="true" />
            Edit
          </button>
          {!isSelf && (
            <button
              type="button"
              disabled={isPending}
              onClick={onDelete}
              aria-label={`Delete ${user.fullName}`}
              className={buttonClass("danger", "sm")}
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
