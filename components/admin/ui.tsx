// @/components/admin/ui.tsx
// Shared chrome for every /admin page. Deliberately mirrors the public landing
// page (app/(public)/page.tsx) — same palette, gold eyebrow + tight-tracked
// extrabold headings, rounded-2xl white cards on #FAFAF7 — so the console
// reads as the same product instead of a bare CRUD backend. Imported by both
// server pages and "use client" tables, so nothing in here uses hooks.
import type { ReactNode } from "react";

export const mono = "font-[family-name:var(--font-geist-mono)]";

const variants = {
  primary: "bg-[#246B45] text-white hover:bg-[#163D2A]",
  secondary:
    "border border-[#d9e2da] bg-white text-[#163D2A] hover:border-[#246B45]",
  danger: "border border-[#f0cdc7] bg-white text-[#B3402F] hover:bg-[#F7E1DE]",
} as const;

const sizes = {
  md: "min-h-11 px-5 text-sm",
  sm: "min-h-9 px-3.5 text-xs",
} as const;

export function buttonClass(
  variant: keyof typeof variants = "primary",
  size: keyof typeof sizes = "md",
) {
  return `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]}`;
}

// Inputs and selects share one shell so filter bars, create forms and inline
// row editors all line up at the same height and border colour. Size lives in
// the helper rather than appended classes: `h-9` tacked onto a string holding
// `h-10` wins or loses by Tailwind's stylesheet order, not by class order.
const controlBase =
  "rounded-xl border border-[#d9e2da] bg-white text-[#18201B] outline-none transition focus:border-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] disabled:cursor-not-allowed disabled:opacity-50";

export function controlClass(
  size: "md" | "sm" = "md",
  width: "full" | "auto" = "full",
) {
  return `${controlBase} ${size === "md" ? "h-10 px-3 text-sm" : "h-9 px-2.5 text-xs"} ${width === "full" ? "w-full" : "w-auto"}`;
}

export function AdminMain({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-20 pt-10 lg:px-8">
      {children}
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-[#e2e7e2] pb-9 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-balance text-3xl font-extrabold leading-[1.08] tracking-[-0.055em] text-[#163D2A] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <div className="mt-4 max-w-2xl text-pretty text-sm leading-6 text-[#667069]">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-extrabold tracking-[0.14em] text-[#929A94]">
      {children}
    </h2>
  );
}

const calloutTones = {
  // Gold: an app-level caveat worth reading before acting.
  note: {
    wrap: "border-[#f0dcb4] bg-[#FBEFD9]",
    icon: "bg-white text-[#B7791F]",
    body: "text-[#7a5a16]",
  },
  // Blue: on-chain reality differs from what this screen can change.
  chain: {
    wrap: "border-[#cdd6f7] bg-[#e7ebfc]",
    icon: "bg-white text-[#3154D5]",
    body: "text-[#2b43a6]",
  },
  // Neutral: context only.
  muted: {
    wrap: "border-[#e2e7e2] bg-[#F3F5F1]",
    icon: "bg-white text-[#246B45]",
    body: "text-[#667069]",
  },
} as const;

export function Callout({
  tone = "note",
  icon,
  title,
  children,
}: {
  tone?: keyof typeof calloutTones;
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}) {
  const style = calloutTones[tone];
  return (
    <div className={`flex gap-4 rounded-2xl border p-5 ${style.wrap}`}>
      {icon && (
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${style.icon}`}
        >
          {icon}
        </span>
      )}
      <div>
        <p className="text-sm font-extrabold text-[#163D2A]">{title}</p>
        <p className={`mt-1 text-sm leading-6 ${style.body}`}>{children}</p>
      </div>
    </div>
  );
}

export function Pill({
  tone,
  children,
}: {
  tone: "good" | "warn" | "bad" | "chain" | "muted";
  children: ReactNode;
}) {
  const tones = {
    good: "bg-[#DDEEE3] text-[#246B45]",
    warn: "bg-[#FBEFD9] text-[#B7791F]",
    bad: "bg-[#F7E1DE] text-[#B3402F]",
    chain: "bg-[#e7ebfc] text-[#3154D5]",
    muted: "bg-[#F3F5F1] text-[#667069]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold ${tones[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="mb-4 rounded-xl border border-[#f0cdc7] bg-[#F7E1DE] px-4 py-3 text-sm font-semibold text-[#B3402F]"
    >
      {children}
    </p>
  );
}

// Card header holds the row count plus whatever filters/actions a table needs,
// so each table body stays a plain <table> and every page lines up.
export function TableCard({
  title,
  meta,
  actions,
  children,
  footer,
}: {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white">
      <header className="flex flex-col gap-3 border-b border-[#e2e7e2] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-extrabold tracking-[-0.02em] text-[#163D2A]">
            {title}
          </h2>
          {meta && <p className="mt-0.5 text-xs text-[#929A94]">{meta}</p>}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>
      <div className="overflow-x-auto">{children}</div>
      {footer && (
        <div className="border-t border-[#e2e7e2] px-5 py-4">{footer}</div>
      )}
    </section>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">{children}</table>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[#e2e7e2] bg-[#FAFAF7]">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({
  children,
  align,
  srOnly,
}: {
  children: ReactNode;
  align?: "right";
  srOnly?: boolean;
}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#929A94] ${align === "right" ? "text-right" : ""}`}
    >
      {srOnly ? <span className="sr-only">{children}</span> : children}
    </th>
  );
}

export const rowClass = "transition hover:bg-[#FAFAF7]";
export const cellClass = "px-5 py-4 align-middle text-[#667069]";

// Index-derived keys live in these helpers (never in a .map callback) so Biome
// doesn't flag the skeleton as a React key smell.
function keys(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
}

const skeletonWidths = ["w-28", "w-20", "w-32", "w-16", "w-24", "w-12"];

export function TableSkeleton({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <tbody className="divide-y divide-[#e2e7e2]">
      {keys("skeleton-row", rows).map((rowKey, rowIndex) => (
        <tr key={rowKey}>
          {keys("skeleton-cell", columns).map((cellKey, columnIndex) => (
            <td key={cellKey} className="px-5 py-4">
              <span
                className={`block h-3 animate-pulse rounded-full bg-[#eef1ee] ${
                  skeletonWidths[
                    (rowIndex + columnIndex) % skeletonWidths.length
                  ]
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function TableEmpty({
  colSpan,
  icon,
  title,
  hint,
}: {
  colSpan: number;
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16">
        <div className="mx-auto grid max-w-sm place-items-center text-center">
          {icon && (
            <span className="grid size-12 place-items-center rounded-2xl bg-[#F3F5F1] text-[#9ec6aa]">
              {icon}
            </span>
          )}
          <p className="mt-4 text-sm font-extrabold text-[#163D2A]">{title}</p>
          {hint && <p className="mt-1 text-sm text-[#929A94]">{hint}</p>}
        </div>
      </td>
    </tr>
  );
}

export function Pagination({
  noun,
  skip,
  limit,
  total,
  hasMore,
  onPrev,
  onNext,
}: {
  noun: string;
  skip: number;
  limit: number;
  total: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-bold text-[#929A94]">
        {total === 0
          ? `0 ${noun}`
          : `Showing ${skip + 1}–${Math.min(skip + limit, total)} of ${total} ${noun}`}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={skip === 0}
          className={buttonClass("secondary", "sm")}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasMore}
          className={buttonClass("secondary", "sm")}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Labels wrap their control instead of using htmlFor: the same field name
// shows up in a create form and an inline row editor on the same page, so
// shared ids would collide.
export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  value,
  onChange,
  step,
  pattern,
  placeholder,
  hint,
  className,
}: {
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  step?: string;
  pattern?: string;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs font-extrabold tracking-[0.02em] text-[#163D2A]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        step={step}
        pattern={pattern}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        className={`mt-1.5 ${controlClass()}`}
      />
      {hint && (
        <span className="mt-1 block text-[11px] text-[#929A94]">{hint}</span>
      )}
    </label>
  );
}

export function SelectField({
  label,
  name,
  required,
  defaultValue,
  value,
  onChange,
  children,
  hint,
  className,
}: {
  label: string;
  name?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs font-extrabold tracking-[0.02em] text-[#163D2A]">
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`mt-1.5 ${controlClass()}`}
      >
        {children}
      </select>
      {hint && (
        <span className="mt-1 block text-[11px] text-[#929A94]">{hint}</span>
      )}
    </label>
  );
}

// Filters sit in a TableCard header where there's no room for visible labels,
// so the label becomes the accessible name instead of being dropped.
export function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={controlClass("sm", "auto")}
    >
      {children}
    </select>
  );
}

export function FormPanel({
  title,
  description,
  onSubmit,
  onCancel,
  submitLabel,
  isPending,
  children,
}: {
  title: string;
  description?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  submitLabel: string;
  isPending?: boolean;
  children: ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-4 rounded-2xl border border-[#e2e7e2] bg-white p-6"
    >
      <p className="text-sm font-extrabold tracking-[-0.02em] text-[#163D2A]">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm leading-6 text-[#667069]">{description}</p>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-t border-[#e2e7e2] pt-5">
        <button
          type="submit"
          disabled={isPending}
          className={buttonClass("primary")}
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={buttonClass("secondary")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
