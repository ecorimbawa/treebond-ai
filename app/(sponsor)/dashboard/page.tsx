// @/app/(sponsor)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SponsorPortfolio } from "@/components/sponsor/SponsorPortfolio";

export default async function SponsorDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <SponsorPortfolio />;
}
