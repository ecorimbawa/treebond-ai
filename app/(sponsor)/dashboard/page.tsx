// @/app/(sponsor)/dashboard/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default function SponsorDashboardPage() {
  return (
    <RouteStub
      audience="Sponsor"
      title="My Trees"
      route="/dashboard"
      description="A sponsor's owned trees: total count, health breakdown (healthy / monitoring / dead), total verifications received, estimated impact, and recent monitoring activity across everything they've sponsored."
      prdRef="PRD.md Section 72"
      links={[{ label: "Explore trees to sponsor", href: "/explore" }]}
    />
  );
}
