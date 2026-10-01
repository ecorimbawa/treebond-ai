"use client";

import { ArrowRight, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#FAFAF7] px-5 py-12 text-[#18201B]">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex h-11 items-center justify-center gap-2 rounded-sm text-lg font-extrabold tracking-[-0.06em] text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
        >
          <Image
            src="/Gemini_Generated_Image_d2an70d2an70d2an-removebg-preview.png"
            alt="TreeBond AI logo"
            width={44}
            height={44}
            priority
            className="h-11 w-11"
          />
          TreeBond
          <span className="rounded-full bg-[#DDEEE3] px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-[#246B45]">
            AI
          </span>
        </Link>

        <div className="rounded-2xl border border-[#e2e7e2] bg-white p-7">
          <h1 className="text-2xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-[#667069]">
            Log in to track your sponsored trees.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? "Logging in..." : "Log In"}
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
            This is a hackathon MVP. Auth is minimal by design.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-[#667069]">
          Don&apos;t have an account?{" "}
          <Link
            href="/create-account"
            className="font-bold text-[#246B45] hover:text-[#163D2A]"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
