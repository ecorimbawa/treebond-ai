// @/app/verifier/layout.tsx
import type { ReactNode } from "react";
import { RoleHeader } from "@/components/RoleHeader";

export default function VerifierLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <RoleHeader
        audience="Verifier"
        links={[{ label: "Verification Queue", href: "/verifier" }]}
      />
      {children}
    </div>
  );
}
