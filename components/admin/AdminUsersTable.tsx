"use client";

import { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  }, [skip]);

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

  return (
    <div>
      {error && <p className="mb-3 text-sm text-[#B3402F]">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e2e7e2] bg-[#FAFAF7]">
            <tr>
              <th className="px-5 py-3 font-bold text-[#929A94]">Name</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Email</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Role</th>
              <th className="px-5 py-3 font-bold text-[#929A94]">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e7e2]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-[#929A94]"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelf = user._id === currentUserId;
                return (
                  <tr key={user._id}>
                    <td className="px-5 py-3 font-bold text-[#163D2A]">
                      {user.fullName}
                      {isSelf && (
                        <span className="ml-1.5 text-xs font-bold text-[#929A94]">
                          (you)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#667069]">{user.email}</td>
                    <td className="px-5 py-3">
                      <select
                        value={user.role}
                        disabled={isSelf || pendingId === user._id}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value as UserRole)
                        }
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
