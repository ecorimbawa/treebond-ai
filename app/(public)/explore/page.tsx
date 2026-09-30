// @/app/(public)/explore/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default function ExplorePage() {
  return (
    <RouteStub
      audience="Public"
      title="Tree Explorer"
      route="/explore"
      description="Browse every public tree on TreeBond AI — search by ID, filter by species, location, status, or project, and sort by age, health, or price. Each card links to that tree's full Tree Passport."
      prdRef="PRD.md Section 13"
      links={[
        { label: "Tree Passport example", href: "/trees/192" },
        { label: "Project Detail example", href: "/projects/central-java-001" },
      ]}
    />
  );
}
