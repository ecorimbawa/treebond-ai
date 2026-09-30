// @/components/RoleHeader.tsx
import Link from "next/link";

export function RoleHeader({
  audience,
  links,
}: {
  audience: string;
  links: { label: string; href: string }[];
}) {
  return (
    <header className="border-b border-[#e2e7e2] bg-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-sm text-sm font-extrabold tracking-[-0.03em] text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
          >
            TreeBond <span className="text-[#246B45]">AI</span>
          </Link>
          <span className="rounded-full bg-[#DDEEE3] px-2.5 py-1 text-[10px] font-extrabold tracking-[0.1em] text-[#246B45]">
            {audience.toUpperCase()}
          </span>
        </div>
        <nav
          className="flex items-center gap-5"
          aria-label={`${audience} navigation`}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-sm text-sm font-bold text-[#667069] transition hover:text-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
