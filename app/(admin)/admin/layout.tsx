// @/app/admin/layout.tsx
import type { ReactNode } from "react";
import { RoleHeader } from "@/components/RoleHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <RoleHeader
        audience="Admin"
        links={[{ label: "Dashboard", href: "/admin" }]}
      />
      {children}
    </div>
  );
}
