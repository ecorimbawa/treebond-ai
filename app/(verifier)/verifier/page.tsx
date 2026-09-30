// @/app/verifier/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default function VerifierQueuePage() {
  return (
    <RouteStub
      audience="Verifier"
      title="Verification Queue"
      route="/verifier"
      description="Every tree with evidence pending review: AI score, GPS match status, and anomaly flag at a glance, so a verifier can triage which trees need a closer look first."
      prdRef="PRD.md Section 74"
      links={[{ label: "Review example", href: "/verifier/ver-000192-05" }]}
    />
  );
}
