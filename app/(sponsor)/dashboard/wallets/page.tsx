// @/app/(sponsor)/dashboard/wallets/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WalletManager } from "@/components/sponsor/WalletManager";

export default async function SponsorWalletsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/wallets");
  }

  return <WalletManager />;
}
