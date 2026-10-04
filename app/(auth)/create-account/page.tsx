"use client";

import { ArrowRight, Sprout } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthImagePanel } from "@/components/auth/AuthImagePanel";
import { Logo } from "@/components/Logo";

export default function CreateAccountPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });

    const result = await response.json();
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Failed to create account.");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="flex min-h-[100dvh] text-[#18201B]">
      <AuthImagePanel
        eyebrow="TREEBOND AI"
        heading="Making Living Assets Verifiable On-Chain."
        body="Join TreeBond AI to sponsor real trees, backed by on-chain verification at every step."
      />

      <div className="flex w-full items-center justify-center bg-[#FAFAF7] px-5 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          <h1 className="text-center text-2xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
            Create your account
          </h1>
          <p className="mt-1 text-center text-sm text-[#667069]">
            Sponsor real trees and track their growth.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-1.5">
              <label
                htmlFor="fullName"
                className="text-xs font-bold text-[#163D2A]"
              >
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="h-11 rounded-xl border border-[#d9e2da] bg-white px-4 text-sm outline-none transition focus:border-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold text-[#163D2A]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl border border-[#d9e2da] bg-white px-4 text-sm outline-none transition focus:border-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-bold text-[#163D2A]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11 rounded-xl border border-[#d9e2da] bg-white px-4 text-sm outline-none transition focus:border-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-[#F7E1DE] px-3 py-2 text-sm font-semibold text-[#B3402F]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#246B45] text-sm font-bold text-white transition duration-200 hover:bg-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && (
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#929A94]">
            <Sprout size={13} aria-hidden="true" />
            New accounts are registered as Sponsors.
          </p>

          <p className="mt-6 text-center text-sm text-[#667069]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#246B45] hover:text-[#163D2A]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
