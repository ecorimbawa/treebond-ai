// @/app/(auth)/login/page.tsx
"use client";
import { ArrowRight, Sprout } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { AuthImagePanel } from "@/components/auth/AuthImagePanel";
import { WalletSignInButton } from "@/components/auth/WalletSignInButton";
import { Logo } from "@/components/Logo";

const HOME_BY_ROLE: Record<string, string> = {
  operator: "/operator/projects",
  verifier: "/verifier",
  admin: "/admin",
};

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

    const session = await getSession();
    const role = session?.user?.role;
    router.push((role && HOME_BY_ROLE[role]) || "/dashboard");
  }

  return (
    <main className="flex min-h-[100dvh] text-[#18201B]">
      <AuthImagePanel
        eyebrow="TREEBOND AI"
        heading="Every tree has a story. Every story has proof."
        body="Log back in to track the trees you've sponsored and watch their verified growth."
      />

      <div className="flex w-full items-center justify-center bg-[#FAFAF7] px-5 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          <h1 className="text-center text-2xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
            Welcome back
          </h1>
          <p className="mt-1 text-center text-sm text-[#667069]">
            Log in to track your sponsored trees.
          </p>

          <div className="mt-6">
            <WalletSignInButton label="Continue with Wallet" />
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e2e7e2]" />
            <span className="text-[11px] font-extrabold tracking-[0.1em] text-[#929A94]">
              OR
            </span>
            <span className="h-px flex-1 bg-[#e2e7e2]" />
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
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
            Signing in with a wallet creates a Sponsor account automatically.
          </p>

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
      </div>
    </main>
  );
}
