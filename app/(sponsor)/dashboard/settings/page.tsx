// @/app/(sponsor)/dashboard/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettings } from "@/components/sponsor/AccountSettings";

export default async function SponsorSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/settings");
  }

  return <AccountSettings />;
}
