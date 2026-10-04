// @/app/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GrantRoleForm } from "@/components/admin/GrantRoleForm";
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

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const stats = await getAdminStats();

  return (
    <main className="mx-auto max-w-[1000px] px-5 py-12">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        ADMIN · DASHBOARD
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A]">
        Admin Dashboard
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat label="Users" value={stats.userCount} />
        <Stat label="Projects" value={stats.projectCount} />
        <Stat label="Trees" value={stats.treeCount} />
        <Stat label="Sponsored" value={stats.sponsoredCount} accent="#246B45" />
        <Stat label="Verifications" value={stats.verificationCount} />
        <Stat
          label="On-chain"
          value={stats.onChainVerificationCount}
          accent="#246B45"
        />
        <Stat label="Transactions" value={stats.txCount} />
        <Stat label="Failed tx" value={stats.failedTxCount} accent="#B3402F" />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-[#163D2A]">
          Grant On-Chain Role
        </h2>
        <p className="mt-1 text-sm text-[#667069]">
          Promoting a user to operator/verifier in the app (not built here)
          doesn't give their wallet any power on-chain — the contract only
          trusts roles granted directly on TreeRegistry. Connect the wallet that
          holds <code>DEFAULT_ADMIN_ROLE</code> below to call{" "}
          <code>grantRole</code> directly — no server-held key involved.
        </p>
        <div className="mt-4 max-w-md">
          <GrantRoleForm />
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent = "#163D2A",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e7e2] bg-white p-5">
      <p className="text-xs font-bold text-[#929A94]">{label.toUpperCase()}</p>
      <p className="mt-1 text-2xl font-extrabold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}
