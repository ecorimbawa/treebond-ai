// @/app/admin/page.tsx
import {
  ArrowUpRight,
  BadgeCheck,
  Blocks,
  Layers,
  Link2,
  ShieldCheck,
  Sprout,
  TriangleAlert,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { GrantRoleForm } from "@/components/admin/GrantRoleForm";
import {
  buttonClass,
  ConsoleMain,
  mono,
  PageHeader,
  SectionLabel,
} from "@/components/console/ui";
import { connectDB } from "@/lib/db/connection";
import {
  BlockchainTransaction,
  Project,
  Tree,
  User,
  Verification,
} from "@/models";

async function getAdminStats() {
  await connectDB();
  const [
    userCount,
    projectCount,
    treeCount,
    sponsoredCount,
    verificationCount,
    onChainVerificationCount,
    txCount,
    failedTxCount,
  ] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Tree.countDocuments(),
    Tree.countDocuments({ status: "SPONSORED" }),
    Verification.countDocuments(),
    Verification.countDocuments({ status: "ON_CHAIN" }),
    BlockchainTransaction.countDocuments(),
    BlockchainTransaction.countDocuments({ status: "failed" }),
  ]);

  return {
    userCount,
    projectCount,
    treeCount,
    sponsoredCount,
    verificationCount,
    onChainVerificationCount,
    txCount,
    failedTxCount,
  };
}

function share(part: number, whole: number) {
  if (whole === 0) return "No data yet";
  return `${Math.round((part / whole) * 100)}% of ${whole}`;
}

const QUICK_LINKS = [
  {
    href: "/admin/users",
    image: "/Admins.png",
    title: "User Management",
    text: "Create accounts, fix names and emails, and move people between sponsor, operator, verifier and admin.",
  },
  {
    href: "/admin/projects",
    image: "/Operators.png",
    title: "All Projects",
    text: "Every reforestation project on the platform and whether it made it on-chain — regardless of which operator registered it.",
  },
  {
    href: "/admin/trees",
    image: "/01-removebg-preview.png",
    title: "All Trees",
    text: "Filter the whole tree population by status, project or operator, then correct field data that was logged wrong.",
  },
  {
    href: "/admin/disputes",
    image: "/Verifiers.png",
    title: "Dispute Queue",
    text: "Trees flagged DISPUTED, waiting on a human decision about what their status should be.",
  },
] as const;

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const stats = await getAdminStats();

  return (
    <ConsoleMain>
      <PageHeader
        eyebrow="ADMIN · CONTROL ROOM"
        title="Every tree, project and verifier — in one view."
        description="This console is where platform-wide data gets inspected and corrected. Anything that touches TreeRegistry is signed from a connected wallet, never from a server-held key."
        actions={
          <>
            <Link href="/admin/disputes" className={buttonClass("primary")}>
              Open Dispute Queue
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/explore" className={buttonClass("secondary")}>
              View Public Explorer
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </>
        }
      />

      <section className="mt-10">
        <SectionLabel>PLATFORM</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users size={18} aria-hidden="true" />}
            label="Users"
            value={stats.userCount}
            hint="Accounts across all four roles"
          />
          <StatCard
            icon={<Blocks size={18} aria-hidden="true" />}
            label="Projects"
            value={stats.projectCount}
            hint="Reforestation sites registered"
          />
          <StatCard
            icon={<Sprout size={18} aria-hidden="true" />}
            label="Trees"
            value={stats.treeCount}
            hint="Living assets being tracked"
          />
          <StatCard
            icon={<BadgeCheck size={18} aria-hidden="true" />}
            label="Sponsored"
            value={stats.sponsoredCount}
            hint={share(stats.sponsoredCount, stats.treeCount)}
            tone="good"
          />
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel>VERIFICATION &amp; CHAIN</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<ShieldCheck size={18} aria-hidden="true" />}
            label="Verifications"
            value={stats.verificationCount}
            hint="Evidence reviews recorded"
          />
          <StatCard
            icon={<Link2 size={18} aria-hidden="true" />}
            label="On-chain"
            value={stats.onChainVerificationCount}
            hint={share(
              stats.onChainVerificationCount,
              stats.verificationCount,
            )}
            tone="chain"
          />
          <StatCard
            icon={<Layers size={18} aria-hidden="true" />}
            label="Transactions"
            value={stats.txCount}
            hint="Writes submitted to Arbitrum"
          />
          <StatCard
            icon={<TriangleAlert size={18} aria-hidden="true" />}
            label="Failed tx"
            value={stats.failedTxCount}
            hint={
              stats.failedTxCount === 0
                ? "Nothing to investigate"
                : share(stats.failedTxCount, stats.txCount)
            }
            tone={stats.failedTxCount > 0 ? "bad" : "muted"}
          />
        </div>
      </section>

      <section className="mt-14">
        <SectionLabel>WHERE TO GO NEXT</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-[#e2e7e2] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#9ec6aa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
            >
              <Image
                src={link.image}
                alt=""
                width={44}
                height={44}
                className="size-11"
              />
              <h3 className="mt-5 text-lg font-extrabold tracking-[-0.03em] text-[#163D2A]">
                {link.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#667069]">
                {link.text}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#246B45]">
                Open
                <ArrowUpRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Dark panel borrowed from the landing page's Tree Passport section —
          this is the one place in the console that signs a real transaction,
          so it shouldn't look like another white CRUD card. */}
      <section className="mt-14 rounded-[28px] bg-[#163D2A] px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <p className="text-xs font-extrabold tracking-[0.16em] text-[#D9A441]">
              ON-CHAIN ACCESS CONTROL
            </p>
            <h2 className="mt-4 max-w-xl text-balance text-3xl font-extrabold leading-[1.1] tracking-[-0.055em] text-white sm:text-4xl">
              Grant a wallet the role the contract actually checks.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d7cc]">
              Promoting someone to operator or verifier in{" "}
              <Link
                href="/admin/users"
                className="font-bold text-white underline decoration-[#D9A441] decoration-2 underline-offset-4"
              >
                User Management
              </Link>{" "}
              changes MongoDB only — their wallet still can&rsquo;t transact.
              TreeRegistry trusts nothing but roles granted directly on the
              contract.
            </p>
            <ul className="mt-7 grid gap-3 text-sm font-semibold text-[#DDEEE3]">
              {[
                "Connect the wallet holding DEFAULT_ADMIN_ROLE",
                "grantRole is signed in your wallet — no server key involved",
                "Revoke uses the same inputs in the opposite direction",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#D9A441]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className={`${mono} mt-7 text-xs leading-5 text-[#91a999]`}>
              TreeRegistry · Arbitrum Sepolia · OPERATOR_ROLE / VERIFIER_ROLE
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <GrantRoleForm />
          </div>
        </div>
      </section>
    </ConsoleMain>
  );
}

const statTones = {
  default: { value: "text-[#163D2A]", icon: "bg-[#F3F5F1] text-[#246B45]" },
  good: { value: "text-[#246B45]", icon: "bg-[#DDEEE3] text-[#246B45]" },
  chain: { value: "text-[#3154D5]", icon: "bg-[#e7ebfc] text-[#3154D5]" },
  bad: { value: "text-[#B3402F]", icon: "bg-[#F7E1DE] text-[#B3402F]" },
  muted: { value: "text-[#929A94]", icon: "bg-[#F3F5F1] text-[#929A94]" },
} as const;

function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  hint: string;
  tone?: keyof typeof statTones;
}) {
  const style = statTones[tone];
  return (
    <div className="rounded-2xl border border-[#e2e7e2] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#9ec6aa]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-10 place-items-center rounded-xl ${style.icon}`}
        >
          {icon}
        </span>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#929A94]">
          {label}
        </p>
      </div>
      <p
        className={`mt-5 text-3xl font-extrabold tracking-[-0.05em] ${style.value}`}
      >
        {value.toLocaleString()}
      </p>
      <p className={`${mono} mt-2 text-[11px] leading-4 text-[#929A94]`}>
        {hint}
      </p>
    </div>
  );
}
