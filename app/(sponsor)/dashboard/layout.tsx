import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SponsorShell } from "@/components/sponsor/SponsorShell";

export default async function SponsorLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Wallet-first accounts carry a synthetic address; showing it in the header
  // would read as a real email the sponsor never gave us.
  const email = session.user.email ?? "";
  const isPlaceholder = email.endsWith("@wallet.treebond.local");

  return (
    <SponsorShell
      user={{
        name: session.user.name ?? "Sponsor",
        email: isPlaceholder ? "" : email,
      }}
    >
      {children}
    </SponsorShell>
  );
}
