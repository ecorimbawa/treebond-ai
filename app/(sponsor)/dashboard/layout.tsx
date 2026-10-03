import type { ReactNode } from "react";
import { RoleHeader } from "@/components/RoleHeader";

export default function SponsorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <RoleHeader
        audience="Sponsor"
        links={[
          { label: "My Trees", href: "/dashboard" },
          { label: "Explore", href: "/explore" },
        ]}
      />
      {children}
    </div>
  );
}
