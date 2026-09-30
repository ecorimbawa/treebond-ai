// @/app/verifier/[verificationId]/page.tsx
import { RouteStub } from "@/components/RouteStub";

export default async function VerifierReviewPage(
  props: PageProps<"/verifier/[verificationId]">,
) {
  const { verificationId } = await props.params;

  return (
    <RouteStub
      audience="Verifier"
      title={`Review — ${verificationId}`}
      route="/verifier/[verificationId]"
      description="Side-by-side comparison of previous evidence, current evidence, and the AI analysis result, with GPS distance-check against the tree's registered coordinates. Ends in Approve or Reject, which creates the verification record and, if approved, hands off to the oracle."
      prdRef="PRD.md Section 10, 36"
      links={[{ label: "Back to Verification Queue", href: "/verifier" }]}
    />
  );
}
