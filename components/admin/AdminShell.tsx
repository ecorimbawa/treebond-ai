// @/components/admin/AdminShell.tsx
"use client";

import {
  Blocks,
  Gauge,
  Menu,
  ShieldAlert,
  Sprout,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

// Admin-only chrome rather than the shared RoleHeader: this console needs an
// active-section indicator, icons and a mobile menu, and operator/verifier/
// sponsor headers shouldn't inherit those just because admin wanted them.
const NAV = [
  { label: "Dashboard", href: "/admin", icon: Gauge },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Projects", href: "/admin/projects", icon: Blocks },
  { label: "Trees", href: "/admin/trees", icon: Sprout },
  { label: "Disputes", href: "/admin/disputes", icon: ShieldAlert },
] as const;

function isActive(pathname: string, href: string) {
  // "/admin" is the dashboard itself, so it only matches exactly — otherwise
  // every nested page would light up two tabs at once.
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FAFAF7] text-[#18201B]">
      <header className="sticky top-0 z-50 border-b border-[#e2e7e2] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-4 px-5 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="hidden rounded-full bg-[#DDEEE3] px-2.5 py-1 text-[10px] font-extrabold tracking-[0.1em] text-[#246B45] sm:inline">
              ADMIN
            </span>
          </div>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Admin navigation"
          >
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] ${
                    active
                      ? "bg-[#DDEEE3] text-[#246B45]"
                      : "text-[#667069] hover:bg-[#F3F5F1] hover:text-[#246B45]"
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-extrabold text-[#163D2A]">
                {user.name}
              </p>
              <p className="text-[11px] text-[#929A94]">{user.email}</p>
            </div>
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[#163D2A] text-xs font-extrabold text-white"
              aria-hidden="true"
            >
              {user.name.trim().charAt(0).toUpperCase() || "A"}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-nav"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              className="grid size-10 place-items-center rounded-xl text-[#163D2A] transition hover:bg-[#F3F5F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] lg:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="admin-mobile-nav"
            aria-label="Admin navigation"
            className="border-t border-[#e2e7e2] bg-white px-5 py-3 lg:hidden"
          >
            <div className="mx-auto grid max-w-[1280px] gap-1">
              {NAV.map(({ label, href, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-bold transition ${
                      active
                        ? "bg-[#DDEEE3] text-[#246B45]"
                        : "text-[#667069] hover:bg-[#F3F5F1]"
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {children}

      <footer className="border-t border-[#e2e7e2] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-5 py-6 lg:px-8">
          <p className="text-xs font-bold text-[#929A94]">
            © 2026 TreeBond AI · Admin console
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3154D5]">
            <Blocks size={13} aria-hidden="true" />
            Arbitrum Sepolia Testnet
          </p>
        </div>
      </footer>
    </div>
  );
}
