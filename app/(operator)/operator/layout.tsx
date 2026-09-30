// @/app/operator/layout.tsx
import type { ReactNode } from "react";
import { RoleHeader } from "@/components/RoleHeader";

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <RoleHeader
        audience="Operator"
        links={[
          { label: "Dashboard", href: "/operator" },
          { label: "Projects", href: "/operator/projects" },
          { label: "New Project", href: "/operator/projects/new" },
        ]}
      />
      {children}
    </div>
  );
}
