// @/components/RouteStub.tsx
import Link from "next/link";
import type { ReactNode } from "react";

const mono = "font-[family-name:var(--font-geist-mono)]";

export function RouteStub({
  audience,
  title,
  route,
  description,
  prdRef,
  links = [],
  children,
}: {
  audience: string;
  title: string;
  route: string;
  description: string;
  prdRef?: string;
  links?: { label: string; href: string }[];
  children?: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-[70vh] max-w-2xl px-5 py-20 sm:py-28">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        {audience.toUpperCase()}
      </p>
      <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.04em] text-[#163D2A] sm:text-4xl">
        {title}
      </h1>
      <p className={`${mono} mt-2 text-xs text-[#929A94]`}>{route}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#FBEFD9] px-2.5 py-1 text-[10px] font-extrabold text-[#B7791F]">
        PLANNED — NOT YET FUNCTIONAL
      </span>
      <p className="mt-6 text-base leading-7 text-[#667069]">{description}</p>
      {prdRef && <p className="mt-4 text-xs text-[#929A94]">Ref: {prdRef}</p>}
      {children}
      {links.length > 0 && (
        <div className="mt-10 border-t border-[#e2e7e2] pt-6">
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#667069]">
            RELATED
          </p>
          <ul className="mt-3 space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-sm text-sm font-bold text-[#246B45] transition hover:text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
                >
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link
        href="/"
        className="mt-10 inline-block rounded-sm text-sm font-bold text-[#667069] transition hover:text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
      >
        ← Back to TreeBond AI
      </Link>
    </main>
  );
}
