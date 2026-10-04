// @/app/operator/layout.tsx
import type { ReactNode } from "react";
import { RoleHeader } from "@/components/RoleHeader";

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <RoleHeader audience="Operator" links={[]} />
      {children}
    </div>
  );
}
