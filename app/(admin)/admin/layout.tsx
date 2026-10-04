// @/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Each page still runs its own guard — this one only exists so the shell can
  // show who's signed in without every page passing the session down.
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <AdminShell
      user={{
        name: session.user.name ?? "Admin",
        email: session.user.email ?? "",
      }}
    >
      {children}
    </AdminShell>
  );
}
