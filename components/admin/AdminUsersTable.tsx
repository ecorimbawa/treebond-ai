"use client";

import { Plus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import type { UserRole } from "@/models";

type AdminUser = {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
};

type Pagination = {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
};

const ROLES: UserRole[] = ["sponsor", "operator", "verifier", "admin"];
const LIMIT = 20;

export function AdminUsersTable({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [skip, setSkip] = useState(0);
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

    fetch(`/api/admin/users?limit=${LIMIT}&skip=${skip}`)
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
  }, [skip, reloadToken]);

  async function handleRoleChange(id: string, role: UserRole) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
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
    const form = new FormData(event.currentTarget);
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
      setIsCreating(false);
      setSkip(0);
      setReloadToken((t) => t + 1);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsCreating((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
        >
          <Plus size={16} aria-hidden="true" />
          New User
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="mb-4 grid gap-3 rounded-2xl border border-[#e2e7e2] bg-white p-5 sm:grid-cols-2"
        >
          <Field label="Full name" name="fullName" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <label className="block text-sm" htmlFor="new-user-role">
            <span className="font-bold text-[#163D2A]">Role</span>
            <select
              id="new-user-role"
              name="role"
              defaultValue="sponsor"
              className="mt-1.5 w-full rounded-xl border border-[#d9e2da] bg-white px-3 py-2 text-sm outline-none focus:border-[#246B45]"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-xl bg-[#246B45] px-4 text-sm font-bold text-white hover:bg-[#163D2A]"
            >
              Create User
            </button>
          </div>
        </form>
      )}

      {error && <p className="mb-3 text-sm text-[#B3402F]">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e2e7e2] bg-[#FAFAF7]">
            <tr>
              <th className="px-5 py-3 font-bold text-[#929A94]">Name</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Email</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Role</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Joined</th>
              <th className="px-5 py-3 font-bold text-[#929A94]" />
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
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelf = user._id === currentUserId;
                const isEditing = editingId === user._id;
                return (
                  <UserRow
                    key={user._id}
                    user={user}
                    isSelf={isSelf}
                    isEditing={isEditing}
                    isPending={pendingId === user._id}
                    onRoleChange={(role) => handleRoleChange(user._id, role)}
                    onStartEdit={() => setEditingId(user._id)}
                    onCancelEdit={() => setEditingId(null)}
                    onSave={(fullName, email) =>
                      handleSaveProfile(user._id, fullName, email)
                    }
                    onDelete={() => handleDelete(user._id)}
                  />
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
              ? "0 users"
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

  if (isEditing) {
    return (
      <tr>
        <td className="px-5 py-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-[#d9e2da] px-2 py-1.5 text-sm outline-none focus:border-[#246B45]"
          />
        </td>
        <td className="px-5 py-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#d9e2da] px-2 py-1.5 text-sm outline-none focus:border-[#246B45]"
          />
        </td>
        <td className="px-5 py-3 text-[#929A94]">{user.role}</td>
        <td className="px-5 py-3 text-[#667069]">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="px-5 py-3">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onSave(fullName, email)}
              className="rounded-lg bg-[#246B45] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-[#d9e2da] px-3 py-1.5 text-xs font-bold text-[#163D2A]"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-5 py-3 font-bold text-[#163D2A]">
        {user.fullName}
        {isSelf && (
          <span className="ml-1.5 text-xs font-bold text-[#929A94]">(you)</span>
        )}
      </td>
      <td className="px-5 py-3 text-[#667069]">{user.email}</td>
      <td className="px-5 py-3">
        <select
          value={user.role}
          disabled={isSelf || isPending}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="rounded-lg border border-[#d9e2da] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#246B45] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </td>
      <td className="px-5 py-3 text-[#667069]">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onStartEdit}
            className="text-xs font-bold text-[#246B45] hover:underline"
          >
            Edit
          </button>
          {!isSelf && (
            <button
              type="button"
              disabled={isPending}
              onClick={onDelete}
              className="text-xs font-bold text-[#B3402F] hover:underline disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm" htmlFor={name}>
      <span className="font-bold text-[#163D2A]">{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-[#d9e2da] px-3 py-2 text-sm outline-none focus:border-[#246B45]"
      />
    </label>
  );
}
