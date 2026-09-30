// @/app/admin/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default function AdminDashboardPage() {
  return (
    <RouteStub
      audience="Admin"
      title="Admin Dashboard"
      route="/admin"
      description="Platform-wide metrics: users, projects, trees, sponsored trees, verification count, on-chain transactions, failed transactions, AI analyses, and IPFS uploads. Sub-pages for managing individual projects, operators, verifiers, and disputes aren't defined in PRD.md yet — still open for design."
      prdRef="PRD.md Section 75"
    />
  );
}
