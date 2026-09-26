// @/app/page.tsx
"use client";

import {
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  BadgeCheck,
  Blocks,
  Building2,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Coins,
  Database,
  FileCheck2,
  Globe,
  HandCoins,
  Layers,
  Map as MapIcon,
  Menu,
  Radar,
  Satellite,
  Server,
  ShieldAlert,
  ShieldCheck,
  TreePine,
  Trees,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

type Tone = "success" | "onchain" | "warning" | "error";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  onchain: "bg-onchain/10 text-onchain",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

const toneDot: Record<Tone, string> = {
  success: "bg-success",
  onchain: "bg-onchain",
  warning: "bg-warning",
  error: "bg-error",
};

type TerritoryStatus = "verified" | "monitoring" | "warning" | "deforestation";

const statusMeta: Record<
  TerritoryStatus,
  { label: string; icon: typeof BadgeCheck; tone: Tone }
> = {
  verified: { label: "Verified", icon: BadgeCheck, tone: "success" },
  monitoring: { label: "Monitoring", icon: Radar, tone: "onchain" },
  warning: { label: "Warning", icon: TriangleAlert, tone: "warning" },
  deforestation: {
    label: "Deforestation Detected",
    icon: ShieldAlert,
    tone: "error",
  },
};

const mapStatusStyles: Record<
  "verified" | "monitoring" | "warning",
  { fill: string; stroke: string; dotFill: string }
> = {
  verified: {
    fill: "fill-success/15 hover:fill-success/35",
    stroke: "stroke-success",
    dotFill: "fill-success",
  },
  monitoring: {
    fill: "fill-onchain/15 hover:fill-onchain/35",
    stroke: "stroke-onchain",
    dotFill: "fill-onchain",
  },
  warning: {
    fill: "fill-warning/15 hover:fill-warning/35",
    stroke: "stroke-warning",
    dotFill: "fill-warning",
  },
};

function Logo() {
  return (
    <a
      href="#top"
      className="flex h-11 items-center gap-2 rounded-sm text-lg font-extrabold tracking-[-0.06em] text-accent-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
      aria-label="EcoRimbawa home"
    >
      <span className="grid size-7 place-items-center rounded-lg bg-primary-700 text-white">
        <Trees size={16} aria-hidden="true" />
      </span>
      EcoRimbawa
    </a>
  );
}

function Button({
  children,
  variant = "primary",
  tone = "light",
  href = "#",
  className = "",
  external = false,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  tone?: "light" | "dark";
  href?: string;
  className?: string;
  external?: boolean;
}) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const styles =
    variant === "primary"
      ? "bg-primary-700 text-white hover:bg-primary-900"
      : tone === "dark"
        ? "border border-white/25 bg-transparent text-white hover:border-white"
        : "border border-border bg-surface text-accent-600 hover:border-primary-700";
  return (
    <a
      href={href}
      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${styles} ${className}`}
    >
      {children}
      <Icon
        size={16}
        aria-hidden="true"
        className="transition-transform group-hover:translate-x-0.5"
      />
    </a>
  );
}

function SectionIntro({
  eyebrow,
  title,
  children,
  centered = false,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="mb-4 text-xs font-extrabold tracking-[0.16em] text-primary-700">
        {eyebrow}
      </p>
      <h2 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-accent-600 sm:text-5xl">
        {title}
      </h2>
      {children && (
        <div className="mt-5 text-pretty text-base leading-7 text-text-secondary sm:text-lg">
          {children}
        </div>
      )}
    </div>
  );
}

function DataRow({
  label,
  value,
  valueNode,
  accent = false,
}: {
  label: string;
  value?: string;
  valueNode?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-text-secondary">{label}</dt>
      <dd
        className={`shrink-0 text-right font-mono font-semibold ${accent ? "text-success" : "text-accent-600"}`}
      >
        {valueNode ?? value}
      </dd>
    </div>
  );
}

function StatusBadge({
  status,
  className = "",
}: {
  status: TerritoryStatus;
  className?: string;
}) {
  const { label, icon: Icon, tone } = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${toneClasses[tone]} ${className}`}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}

function Chip({
  tone,
  icon: Icon,
  children,
}: {
  tone: Tone;
  icon: typeof BadgeCheck;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold tracking-wide ${toneClasses[tone]}`}
    >
      <Icon size={13} aria-hidden="true" />
      {children}
    </span>
  );
}

function LegendItem({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary">
      <span className={`size-2.5 rounded-full ${toneDot[tone]}`} />
      {label}
    </span>
  );
}

function FlowChain({ steps }: { steps: { icon: ReactNode; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <div className="flex w-[126px] flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-4 text-center">
            <span className="grid size-9 place-items-center rounded-lg bg-primary-100 text-primary-700">
              {step.icon}
            </span>
            <span className="text-xs font-bold leading-tight text-accent-600">
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight
              size={16}
              className="hidden shrink-0 text-primary-500 sm:block"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function HeroMapBackdrop() {
  return (
    <div
      className="pointer-events-none absolute -inset-8 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-8 rounded-[2.5rem] bg-primary-100 blur-3xl" />
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full opacity-60"
      >
        <title>Decorative territory polygon</title>
        <polygon
          points="60,260 110,140 220,90 340,150 370,260 300,350 130,360"
          fill="none"
          stroke="var(--primary-500)"
          strokeWidth={1.5}
          strokeDasharray="6 6"
        />
        <polygon
          points="140,235 180,165 255,155 290,225 250,290 165,288"
          fill="var(--primary-500)"
          fillOpacity="0.12"
          stroke="var(--primary-700)"
          strokeWidth={1.5}
        />
        <circle cx="215" cy="222" r="4" fill="var(--primary-700)" />
      </svg>
    </div>
  );
}

function HeroTerritoryCard() {
  return (
    <article className="w-full rounded-2xl border border-border bg-surface p-5 shadow-[0_20px_50px_rgba(49,35,25,.12)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold tracking-[0.12em] text-text-secondary">
          PROTECTED INDIGENOUS FOREST
        </p>
        <StatusBadge status="verified" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-muted p-4">
          <p className="text-xs font-semibold text-text-secondary">
            Forest Health
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-success">
            94%
          </p>
        </div>
        <div className="rounded-xl bg-surface-muted p-4">
          <p className="text-xs font-semibold text-text-secondary">
            Monitoring
          </p>
          <p className="mt-1 text-sm font-extrabold leading-snug text-accent-600">
            Satellite + Ground
          </p>
        </div>
      </div>
      <div className="my-5 border-t border-border" />
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-text-secondary">
          Blockchain Record
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-onchain">
          <BadgeCheck size={13} aria-hidden="true" /> Verified
        </span>
      </div>
    </article>
  );
}

interface Territory {
  id: string;
  name: string;
  status: "verified" | "monitoring" | "warning";
  area: string;
  coverage: string;
  lastMonitoring: string;
  verification: string;
  points: string;
  marker: [number, number];
}

const territories: Territory[] = [
  {
    id: "TA-IND-00118",
    name: "Wilayah Adat Example 01",
    status: "verified",
    area: "12,480 ha",
    coverage: "91.4%",
    lastMonitoring: "2 days ago",
    verification: "Satellite + Ground",
    points: "50,60 140,50 170,120 130,180 60,170 30,110",
    marker: [100, 115],
  },
  {
    id: "TA-IND-00119",
    name: "Wilayah Adat Example 02",
    status: "monitoring",
    area: "8,120 ha",
    coverage: "87.2%",
    lastMonitoring: "6 hours ago",
    verification: "Satellite",
    points: "230,70 320,60 360,120 330,180 250,170 220,120",
    marker: [290, 115],
  },
  {
    id: "TA-IND-00120",
    name: "Wilayah Adat Example 03",
    status: "warning",
    area: "15,900 ha",
    coverage: "78.9%",
    lastMonitoring: "1 day ago",
    verification: "Satellite + Ground",
    points: "60,220 150,210 180,280 140,350 70,340 40,280",
    marker: [110, 285],
  },
  {
    id: "TA-IND-00121",
    name: "Wilayah Adat Example 04",
    status: "verified",
    area: "9,340 ha",
    coverage: "93.1%",
    lastMonitoring: "3 days ago",
    verification: "Satellite + Ground",
    points: "230,230 330,220 370,280 340,350 250,340 220,280",
    marker: [295, 285],
  },
];

function TerritoryDetailCard({ territory }: { territory: Territory }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-6 shadow-[0_20px_50px_rgba(49,35,25,.08)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs font-bold text-text-muted">
          {territory.id}
        </p>
        <StatusBadge status={territory.status} />
      </div>
      <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-accent-600">
        {territory.name}
      </h3>
      <dl className="mt-6 grid gap-3">
        <DataRow label="Area" value={territory.area} />
        <DataRow label="Forest Coverage" value={territory.coverage} accent />
        <DataRow label="Last Monitoring" value={territory.lastMonitoring} />
        <DataRow label="Verification" value={territory.verification} />
        <DataRow label="Blockchain" value="Verified" />
      </dl>
      <a
        href="#evidence"
        className="mt-6 flex min-h-11 items-center justify-between rounded-xl bg-accent-600 px-4 text-sm font-bold text-white transition hover:bg-primary-700"
      >
        View Territory <ArrowRight size={16} aria-hidden="true" />
      </a>
    </article>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div>
      <p className="text-xs font-extrabold tracking-[.14em] text-white/50">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="rounded-sm text-sm transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const nav = [
  ["Problem", "#problem"],
  ["Solution", "#solution"],
  ["How It Works", "#how-it-works"],
  ["Explorer", "#explorer"],
  ["Technology", "#technology"],
] as const;

const problems = [
  {
    icon: FileCheck2,
    tag: "01 — LIMITED RECOGNITION",
    title: "Wilayah Ada. Bukti Terfragmentasi.",
    text: "Dokumen, batas wilayah, dan bukti pengelolaan sering berada pada sistem yang berbeda sehingga sulit diverifikasi secara terbuka.",
  },
  {
    icon: TreePine,
    tag: "02 — FOREST UNDER PRESSURE",
    title: "Forest + Economic Pressure",
    text: "Ekspansi perkebunan dan pembalakan menciptakan tekanan ekonomi terhadap kawasan hutan.",
  },
  {
    icon: Layers,
    tag: "03 — FRAGMENTED MONITORING",
    title: "Data Ada. Sistemnya Terpisah.",
    text: "Data satelit, patroli lapangan, dokumen, dan laporan konservasi belum terhubung dalam satu sumber bukti.",
  },
  {
    icon: CircleDollarSign,
    tag: "04 — DISCONNECTED VALUE",
    title: "Nilai Konservasi Tidak Mengalir Langsung.",
    text: "Nilai yang dihasilkan dari perlindungan hutan belum memiliki jalur distribusi yang transparan menuju masyarakat penjaganya.",
  },
] as const;

const pillars = [
  {
    icon: ClipboardCheck,
    step: "01",
    label: "DOCUMENT",
    title: "Register the Territory",
    text: "Polygon wilayah dan dokumen pendukung dicatat ke dalam sistem.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    label: "VERIFY",
    title: "Verify the Forest",
    text: "NGO dan verifier melakukan validasi wilayah serta ground-truthing.",
  },
  {
    icon: Satellite,
    step: "03",
    label: "MONITOR",
    title: "Monitor Continuously",
    text: "Data satelit membantu memantau perubahan tutupan hutan secara berkala.",
  },
  {
    icon: FileCheck2,
    step: "04",
    label: "PROVE",
    title: "Create Verifiable Evidence",
    text: "Status konservasi dan aktivitas penting dicatat sebagai blockchain evidence yang dapat diverifikasi publik.",
  },
] as const;

const howItWorks = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Register Territory",
    text: "NGO pendamping memasukkan polygon wilayah dan dokumen pendukung.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Verify",
    text: "Data wilayah diverifikasi sebelum masuk ke registry.",
  },
  {
    icon: Trees,
    step: "03",
    title: "Create Territory Record",
    text: "Wilayah yang tervalidasi direpresentasikan melalui Soulbound dNFT.",
  },
  {
    icon: Satellite,
    step: "04",
    title: "Monitor Forest",
    text: "Data satelit dan ground verification memperbarui kondisi hutan.",
  },
  {
    icon: Coins,
    step: "05",
    title: "Generate Conservation Value",
    text: "Kinerja konservasi yang memenuhi kriteria dapat menghasilkan aset karbon.",
  },
  {
    icon: HandCoins,
    step: "06",
    title: "Distribute Value",
    text: "Nilai ekonomi dari konservasi dialirkan secara transparan menuju komunitas terkait.",
  },
] as const;

const whyBlockchain = [
  {
    icon: Database,
    tag: "IMMUTABLE EVIDENCE",
    title: "Bukti yang Sulit Diubah",
    text: "Status verifikasi dan aktivitas penting memiliki histori yang dapat ditelusuri.",
  },
  {
    icon: ArrowRightLeft,
    tag: "TRANSPARENT DISTRIBUTION",
    title: "Follow the Money",
    text: "Distribusi nilai konservasi dapat diaudit secara transparan.",
  },
  {
    icon: ShieldAlert,
    tag: "NON-TRANSFERABLE TERRITORY",
    title: "Territory Cannot Be Traded",
    text: "Soulbound dNFT mencegah representasi wilayah dipindahkan atau diperjualbelikan.",
  },
  {
    icon: Globe,
    tag: "OPEN VERIFICATION",
    title: "Don&apos;t Trust. Verify.",
    text: "Publik, NGO, maupun pembeli dapat memeriksa blockchain evidence secara independen.",
  },
] as const;

const dmrvColumns = [
  {
    icon: Satellite,
    title: "Satellite Monitoring",
    text: "Data geospasial digunakan untuk mengamati perubahan tutupan vegetasi dan kondisi wilayah.",
  },
  {
    icon: Users,
    title: "Ground Verification",
    text: "NGO atau verifier melakukan pemeriksaan lapangan untuk memperkuat bukti dari data satelit.",
  },
  {
    icon: Blocks,
    title: "Blockchain Evidence",
    text: "Hasil verifikasi penting dapat dicatat sebagai bukti yang dapat ditelusuri.",
  },
] as const;

const flowDmrv = [
  { icon: <Satellite size={18} aria-hidden="true" />, label: "Satellite" },
  { icon: <TreePine size={18} aria-hidden="true" />, label: "Forest Polygon" },
  {
    icon: <Users size={18} aria-hidden="true" />,
    label: "Ground Verification",
  },
  { icon: <Server size={18} aria-hidden="true" />, label: "Oracle" },
  {
    icon: <Blocks size={18} aria-hidden="true" />,
    label: "Blockchain Record",
  },
];

const flowEconomics = [
  {
    icon: <TreePine size={18} aria-hidden="true" />,
    label: "Protected Forest",
  },
  {
    icon: <BadgeCheck size={18} aria-hidden="true" />,
    label: "Verified Conservation",
  },
  { icon: <Coins size={18} aria-hidden="true" />, label: "Carbon Value" },
  {
    icon: <Building2 size={18} aria-hidden="true" />,
    label: "Corporate ESG Buyer",
  },
  { icon: <CircleDollarSign size={18} aria-hidden="true" />, label: "USDC" },
  {
    icon: <Users size={18} aria-hidden="true" />,
    label: "Community Treasury",
  },
];

const forestStates = [
  {
    tag: "FOREST HEALTHY",
    tone: "success" as const,
    icon: BadgeCheck,
    desc: "Monitoring menunjukkan kondisi hutan sesuai kriteria.",
    consequences: ["Verification maintained", "Conservation value continues"],
  },
  {
    tag: "DEFORESTATION DETECTED",
    tone: "warning" as const,
    icon: TriangleAlert,
    desc: "Sistem mendeteksi perubahan kondisi hutan yang membutuhkan verifikasi.",
    consequences: [
      "Verification triggered",
      "Distribution may be paused",
      "Ground inspection requested",
    ],
  },
  {
    tag: "DEFORESTATION CONFIRMED",
    tone: "error" as const,
    icon: ShieldAlert,
    desc: "Jika pelanggaran dikonfirmasi, distribusi nilai dan penerbitan karbon dihentikan.",
    consequences: [
      "Distribution stopped",
      "Carbon issuance suspended",
      "Territory record updated",
    ],
  },
] as const;

const stakeholders = [
  {
    icon: Users,
    role: "PROTECT",
    title: "Masyarakat Adat",
    text: "Menjaga dan mengelola kawasan hutan.",
    verb: "Receives",
    receives: "Conservation Value",
  },
  {
    icon: ShieldCheck,
    role: "VERIFY",
    title: "NGO / Verifier",
    text: "Mendampingi registrasi wilayah dan melakukan ground verification.",
    verb: "Receives",
    receives: "Verification Incentive",
  },
  {
    icon: Building2,
    role: "FUND",
    title: "Corporate ESG",
    text: "Membeli aset konservasi yang memiliki bukti terverifikasi.",
    verb: "Receives",
    receives: "Verifiable Environmental Impact",
  },
  {
    icon: Server,
    role: "COORDINATE",
    title: "Technology",
    text: "Blockchain, oracle, dan data geospasial menghubungkan seluruh bukti dan transaksi.",
    verb: "Provides",
    receives: "Transparency & Automation",
  },
] as const;

const techStack = [
  {
    icon: Layers,
    label: "FRONTEND",
    title: "Next.js / React",
    text: "Interface cepat dan familiar bagi pengguna.",
  },
  {
    icon: Satellite,
    label: "GEOSPATIAL",
    title: "Satellite Data",
    text: "Monitoring tutupan dan kondisi hutan.",
  },
  {
    icon: Database,
    label: "DATA LAYER",
    title: "PostgreSQL / Supabase",
    text: "Dokumen, profil, polygon, dan data non-transaksional.",
  },
  {
    icon: Server,
    label: "ORACLE",
    title: "Oracle Infrastructure",
    text: "Menghubungkan data dunia nyata dengan smart contract.",
  },
  {
    icon: Blocks,
    label: "BLOCKCHAIN",
    title: "Arbitrum",
    text: "Lapisan settlement dan blockchain evidence.",
  },
  {
    icon: FileCheck2,
    label: "SMART CONTRACTS",
    title: "Solidity + Foundry",
    text: "Territory Registry, Carbon Vault, dan distribusi nilai.",
  },
] as const;

const impactMetrics = [
  { icon: TreePine, value: "12,480 ha", label: "Protected Territory" },
  { icon: Users, value: "4", label: "Registered Communities" },
  { icon: Trees, value: "91.4%", label: "Forest Coverage" },
  { icon: Radar, value: "24/7", label: "Satellite Monitoring" },
  { icon: ClipboardCheck, value: "100%", label: "Traceable Distribution" },
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <main id="top" className="overflow-x-clip bg-background text-text-primary">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "border-b border-border bg-surface/90 backdrop-blur" : "bg-background/80"}`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Primary navigation"
          >
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="inline-flex h-11 items-center rounded-sm text-sm font-bold text-text-secondary transition hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#explorer"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-bold text-accent-600 transition hover:border-primary-700"
            >
              Explore Map
            </a>
            <Button href="#launch" className="min-h-10 px-4">
              Launch App
            </Button>
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg text-accent-600 focus-visible:outline-2 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-nav"
            className="border-t border-border bg-surface px-5 py-4 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto grid max-w-[1280px] gap-1">
              {nav.map(([label, href]) => (
                <a
                  onClick={() => setMenuOpen(false)}
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-3 text-sm font-bold hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                >
                  {label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  window.location.hash = "explorer";
                }}
                className="rounded-lg border border-border px-3 py-3 text-center text-sm font-bold text-accent-600"
              >
                Explore Map
              </button>
              <Button href="#launch" className="mt-2">
                Launch App
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-[1280px] gap-12 px-5 pb-24 pt-36 sm:pt-44 lg:grid-cols-12 lg:items-center lg:px-8 lg:pb-36">
        <div className="lg:col-span-7">
          <p className="text-xs font-extrabold tracking-[.16em] text-primary-700">
            DECENTRALIZED FOREST CONSERVATION INFRASTRUCTURE
          </p>
          <h1 className="mt-5 max-w-2xl text-balance text-5xl font-extrabold leading-[1.02] tracking-[-.06em] text-accent-600 sm:text-6xl lg:text-[4.2rem]">
            <span className="block">Protect the Land.</span>
            <span className="block">Preserve the Forest.</span>
            <span className="block">Share the Value.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-text-secondary">
            EcoRimbawa menghubungkan wilayah adat, monitoring hutan, verifikasi
            lapangan, dan blockchain untuk membangun konservasi yang transparan
            dan berkelanjutan secara ekonomi.
          </p>
          <p className="mt-4 max-w-xl text-pretty text-base font-extrabold leading-7 text-accent-600">
            Tanahnya tidak dijual.
            <br />
            Nilai konservasinya yang dibuktikan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#explorer">Explore Protected Forests</Button>
            <Button href="#how-it-works" variant="secondary">
              See How It Works
            </Button>
          </div>
          <p className="mt-9 inline-flex items-center gap-2 text-xs font-bold tracking-wide text-text-secondary">
            <Blocks size={14} className="text-primary-700" aria-hidden="true" />
            Built on Arbitrum
          </p>
        </div>
        <div className="relative lg:col-span-5">
          <HeroMapBackdrop />
          <HeroTerritoryCard />
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="bg-surface-muted py-24 sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="THE PROBLEM"
            title={
              <>
                Hutan Memiliki Nilai Besar.
                <br />
                Tapi Menjaganya Belum Cukup Menguntungkan.
              </>
            }
            centered
          >
            Tekanan ekonomi membuat eksploitasi lahan sering memberikan
            keuntungan lebih cepat dibandingkan konservasi. Sementara itu,
            dokumentasi wilayah, monitoring hutan, dan distribusi manfaat
            konservasi masih berjalan secara terpisah.
          </SectionIntro>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map(({ icon: Icon, tag, title, text }) => (
              <article
                key={tag}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary-100 text-primary-700">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <p className="mt-5 text-[11px] font-extrabold tracking-[.13em] text-primary-700">
                  {tag}
                </p>
                <h3 className="mt-2 text-lg font-extrabold text-accent-600">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Transition statement */}
      <section className="bg-accent-600 px-5 py-20 text-center sm:py-28">
        <p className="mx-auto max-w-3xl text-balance text-3xl font-extrabold leading-tight tracking-[-.04em] text-white sm:text-4xl lg:text-5xl">
          What if protecting the forest becomes more valuable than destroying
          it?
        </p>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
          EcoRimbawa mengubah konservasi dari sekadar aktivitas sosial menjadi
          infrastruktur ekonomi yang dapat diverifikasi.
        </p>
      </section>

      {/* Solution */}
      <section
        id="solution"
        className="border-b border-border bg-surface py-24 sm:py-36"
      >
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="THE SOLUTION"
            title={
              <>
                One Infrastructure.
                <br />
                From Territory to Verified Impact.
              </>
            }
            centered
          >
            EcoRimbawa menghubungkan dokumentasi wilayah, monitoring satelit,
            verifikasi lapangan, blockchain evidence, dan distribusi nilai dalam
            satu ekosistem.
          </SectionIntro>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, step, label, title, text }) => (
              <article
                key={step}
                className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-primary-500"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary-100 text-primary-700">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    {step}
                  </span>
                </div>
                <p className="mt-6 text-xs font-extrabold tracking-[.14em] text-primary-700">
                  {label}
                </p>
                <h3 className="mt-2 text-xl font-extrabold tracking-[-.04em] text-accent-600">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Territory Explorer */}
      <section id="explorer" className="bg-surface py-24 sm:py-36">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="PUBLIC TERRITORY EXPLORER"
            title="Explore Protected Indigenous Forests."
            centered
          >
            Jelajahi wilayah yang telah didokumentasikan, lihat kondisi
            hutannya, dan verifikasi bukti konservasinya.
          </SectionIntro>
          <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="rounded-2xl border border-border bg-surface-muted p-4 sm:p-6 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[.13em] text-text-muted">
                  <MapIcon size={14} aria-hidden="true" /> TERRITORY MAP
                </span>
                <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-extrabold text-text-muted">
                  DEMO DATA
                </span>
              </div>
              {/* biome-ignore lint/a11y/useSemanticElements: groups focusable SVG shapes; <fieldset> is not applicable inside <svg> */}
              <svg
                viewBox="0 0 400 400"
                className="mt-4 aspect-square w-full"
                role="group"
                aria-label="Peta ilustratif wilayah adat terlindungi"
              >
                {territories.map((t, i) => (
                  // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA pattern for an interactive SVG shape; <button> is not valid inside <svg>
                  <polygon
                    key={t.id}
                    points={t.points}
                    strokeWidth={selected === i ? 3 : 1.5}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lihat detail ${t.name}`}
                    aria-pressed={selected === i}
                    onClick={() => setSelected(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(i);
                      }
                    }}
                    className={`cursor-pointer outline-none transition-all duration-200 ${mapStatusStyles[t.status].fill} ${mapStatusStyles[t.status].stroke}`}
                  />
                ))}
                {territories.map((t, i) => (
                  <circle
                    key={`${t.id}-marker`}
                    cx={t.marker[0]}
                    cy={t.marker[1]}
                    r={selected === i ? 6 : 4}
                    className={`pointer-events-none transition-all duration-200 ${mapStatusStyles[t.status].dotFill}`}
                  />
                ))}
              </svg>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
                <LegendItem tone="success" label="Verified" />
                <LegendItem tone="onchain" label="Monitoring" />
                <LegendItem tone="warning" label="Warning" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <TerritoryDetailCard territory={territories[selected]} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-surface-muted py-24 sm:py-36">
        <div className="mx-auto max-w-[900px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="HOW IT WORKS"
            title={
              <>
                From Real Forest
                <br />
                to Verifiable Digital Evidence.
              </>
            }
            centered
          />
          <ol className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            {howItWorks.map(({ icon: Icon, step, title, text }, i) => (
              <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
                <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-primary-100 text-primary-700">
                  <Icon size={19} aria-hidden="true" />
                </span>
                {i < howItWorks.length - 1 && (
                  <span className="absolute left-[22px] top-11 h-[calc(100%-28px)] border-l border-dashed border-border" />
                )}
                <div className="pt-1.5">
                  <p className="font-mono text-xs font-bold text-text-muted">
                    STEP {step}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-accent-600">
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Responsible Tokenization */}
      <section id="tokenization" className="bg-accent-600 py-24 sm:py-32">
        <div className="mx-auto max-w-[1100px] px-5 text-center lg:px-8">
          <p className="text-xs font-extrabold tracking-[0.16em] text-primary-500">
            RESPONSIBLE TOKENIZATION
          </p>
          <h2 className="mt-4 text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white sm:text-5xl">
            We Don&apos;t Tokenize the Land.
          </h2>
          <p className="mx-auto mt-8 text-4xl font-extrabold tracking-[-0.03em] text-white/90 sm:text-5xl">
            Tanah Adat <span className="text-primary-500">≠</span> Tradable
            Asset
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
            EcoRimbawa tidak memecah kepemilikan tanah menjadi token yang dapat
            diperjualbelikan. Wilayah direpresentasikan melalui{" "}
            <strong className="text-white">Soulbound dNFT</strong> yang tidak
            dapat dipindahtangankan.
          </p>
          <p className="mt-6 text-sm font-bold text-white/60">
            Blockchain digunakan untuk mencatat:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {[
              "Territory Identity",
              "Verification Evidence",
              "Forest Condition",
              "Conservation Activity",
              "Value Distribution",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/90"
              >
                <Check
                  size={13}
                  aria-hidden="true"
                  className="text-primary-500"
                />
                {item}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-xl text-balance border-t border-white/10 pt-8 text-xl font-extrabold leading-8 text-white">
            The land stays with the community.
            <br />
            Blockchain only protects the evidence.
          </p>
        </div>
      </section>

      {/* Why Blockchain */}
      <section
        id="why-blockchain"
        className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8"
      >
        <SectionIntro
          eyebrow="WHY BLOCKCHAIN"
          title="Trust Should Be Verifiable."
          centered
        >
          Blockchain tidak digunakan karena semua data harus berada on-chain —
          hanya pada bagian yang membutuhkan bukti permanen dan transparansi.
        </SectionIntro>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyBlockchain.map(({ icon: Icon, tag, title, text }) => (
            <article
              key={tag}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary-100 text-primary-700">
                <Icon size={21} aria-hidden="true" />
              </span>
              <p className="mt-5 text-[11px] font-extrabold tracking-[.13em] text-primary-700">
                {tag}
              </p>
              <h3 className="mt-2 text-lg font-extrabold text-accent-600">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Conservation Economics */}
      <section id="economics" className="bg-surface-muted py-24 sm:py-36">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="CONSERVATION ECONOMICS"
            title={
              <>
                Make Standing Forests
                <br />
                Economically Valuable.
              </>
            }
            centered
          >
            Ketika hutan tetap sehat dan verifikasi konservasi terpenuhi, sistem
            dapat menghasilkan nilai ekonomi dari aset karbon. Nilai tersebut
            kemudian dapat didistribusikan kepada pihak yang menjaga dan
            memverifikasi hutan.
          </SectionIntro>
          <div className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-10">
            <FlowChain steps={flowEconomics} />
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-balance text-center text-lg font-extrabold leading-8 text-accent-600 sm:text-xl">
            Protect Forest
            <ArrowRight
              className="mx-1.5 inline text-primary-500"
              size={18}
              aria-hidden="true"
            />
            Generate Value
            <ArrowRight
              className="mx-1.5 inline text-primary-500"
              size={18}
              aria-hidden="true"
            />
            Fund Communities
            <ArrowRight
              className="mx-1.5 inline text-primary-500"
              size={18}
              aria-hidden="true"
            />
            Protect More Forest
          </p>
        </div>
      </section>

      {/* dMRV */}
      <section
        id="dmrv"
        className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8"
      >
        <SectionIntro
          eyebrow="DECENTRALIZED MRV"
          title={
            <>
              Satellite Above.
              <br />
              People on the Ground.
              <br />
              Evidence On-Chain.
            </>
          }
          centered
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {dmrvColumns.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <Icon className="text-primary-700" size={24} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-extrabold text-accent-600">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {text}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-border bg-surface-muted p-6 sm:p-10">
          <FlowChain steps={flowDmrv} />
        </div>
      </section>

      {/* Anti-deforestation mechanism */}
      <section id="protection" className="bg-surface-muted py-24 sm:py-36">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="FOREST PROTECTION MECHANISM"
            title="Conservation Has Rules."
            centered
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {forestStates.map((state) => (
              <article
                key={state.tag}
                className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
              >
                <Chip tone={state.tone} icon={state.icon}>
                  {state.tag}
                </Chip>
                <p className="mt-5 text-sm leading-6 text-text-secondary">
                  {state.desc}
                </p>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
                  {state.consequences.map((c) => (
                    <li
                      key={c}
                      className="flex items-center gap-2.5 text-sm font-bold text-accent-600"
                    >
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-primary-500"
                        aria-hidden="true"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Blockchain Evidence Record */}
      <section
        id="evidence"
        className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8"
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <SectionIntro
              eyebrow="PUBLIC EVIDENCE"
              title="Every Claim Should Have Proof."
            />
            <p className="mt-6 text-sm font-extrabold text-primary-700">
              Transparent by design. Verifiable by anyone.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <article className="rounded-2xl border border-border bg-surface p-6 shadow-[0_20px_50px_rgba(49,35,25,.08)] sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[.14em] text-text-muted">
                  <Blocks size={14} aria-hidden="true" /> BLOCKCHAIN EVIDENCE
                </span>
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-extrabold text-text-muted">
                  DEMO DATA
                </span>
              </div>
              <dl className="mt-6 grid gap-3.5">
                <DataRow label="Territory" value="TA-IND-00127" />
                <DataRow
                  label="Status"
                  valueNode={<StatusBadge status="verified" />}
                />
                <DataRow label="Forest Health" value="Healthy" accent />
                <DataRow label="Last Verification" value="24 Sep 2026" />
                <DataRow label="Evidence" value="Satellite + Ground" />
                <DataRow label="Network" value="Arbitrum" />
                <DataRow label="Transaction" value="0x7A4...93F" />
              </dl>
              <a
                href="#technology"
                className="mt-7 flex min-h-11 items-center justify-between rounded-xl bg-accent-600 px-4 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                Verify On-Chain <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* Stakeholder ecosystem */}
      <section
        id="stakeholders"
        className="border-y border-border bg-surface-muted py-24 sm:py-36"
      >
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="ONE ECOSYSTEM"
            title="Everyone Has a Role."
            centered
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stakeholders.map(
              ({ icon: Icon, role, title, text, verb, receives }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-primary-100 text-primary-700">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-extrabold tracking-[.14em] text-primary-700">
                    {role}
                  </p>
                  <h3 className="mt-1 text-xl font-extrabold tracking-[-.04em] text-accent-600">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {text}
                  </p>
                  <p className="mt-4 border-t border-border pt-4 text-xs font-bold text-text-muted">
                    {verb}: <span className="text-accent-600">{receives}</span>
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="py-24 sm:py-36">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="BUILT FOR TRANSPARENCY"
            title={
              <>
                Web2 Simplicity.
                <br />
                Web3 Verifiability.
              </>
            }
            centered
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map(({ icon: Icon, label, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="text-primary-700"
                    size={22}
                    aria-hidden="true"
                  />
                  <p className="text-xs font-extrabold tracking-[.13em] text-text-muted">
                    {label}
                  </p>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-accent-600">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Arbitrum */}
      <section
        id="why-arbitrum"
        className="bg-accent-600 py-24 text-white sm:py-32"
      >
        <div className="mx-auto max-w-[900px] px-5 text-center lg:px-8">
          <p className="text-xs font-extrabold tracking-[.16em] text-primary-500">
            WHY ARBITRUM
          </p>
          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-[-.055em] sm:text-5xl">
            Built on Arbitrum.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
            EcoRimbawa membutuhkan blockchain yang kompatibel dengan ekosistem
            Ethereum sekaligus memungkinkan transaksi dengan biaya lebih rendah
            untuk penggunaan berskala besar.
          </p>
          <p className="mt-8 text-sm font-bold text-white/60">
            Arbitrum menjadi settlement layer untuk:
          </p>
          <div className="mx-auto mt-4 grid max-w-lg grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              "Territory Registry",
              "Blockchain Evidence",
              "Carbon Assets",
              "Transparent Distribution",
            ].map((item) => (
              <span
                key={item}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-white/90"
              >
                {item}
              </span>
            ))}
          </div>
          <Button
            href="#technology"
            variant="secondary"
            tone="dark"
            external
            className="mt-10"
          >
            View Smart Contracts
          </Button>
        </div>
      </section>

      {/* Impact */}
      <section
        id="impact"
        className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8"
      >
        <div className="flex flex-col items-center gap-3">
          <SectionIntro
            eyebrow="MEASURABLE IMPACT"
            title="Conservation You Can Measure."
            centered
          />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-center text-[11px] font-extrabold tracking-wide text-warning">
            Demo Data — illustrative figures, not yet from live deployment
          </span>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {impactMetrics.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-surface p-5 text-center sm:p-6"
            >
              <Icon
                className="mx-auto text-primary-700"
                size={22}
                aria-hidden="true"
              />
              <p className="mt-3 text-2xl font-extrabold tracking-[-.03em] text-accent-600 sm:text-3xl">
                {value}
              </p>
              <p className="mt-1 text-xs font-bold text-text-secondary">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="launch"
        className="relative overflow-hidden bg-accent-600 px-5 py-24 text-center sm:py-32"
      >
        <svg
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
          aria-hidden="true"
        >
          <title>Decorative aerial territory pattern</title>
          <polygon
            points="60,320 160,120 340,60 520,140 600,320 420,380 200,380"
            fill="none"
            stroke="white"
            strokeWidth={1.5}
          />
          <polygon
            points="420,300 520,180 680,160 740,280 660,360 500,360"
            fill="none"
            stroke="white"
            strokeWidth={1.5}
          />
        </svg>
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-extrabold tracking-[.16em] text-primary-500">
            ECORIMBAWA
          </p>
          <h2 className="mx-auto mt-4 text-balance text-4xl font-extrabold tracking-[-.055em] text-white sm:text-5xl">
            Protecting Forests Should Create Value.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-white/70">
            Bangun sistem di mana masyarakat mendapat manfaat ketika hutan tetap
            berdiri — dengan bukti yang transparan dan dapat diverifikasi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="#explorer">Explore Protected Forests</Button>
            <Button href="#how-it-works" variant="secondary" tone="dark">
              Register a Territory
            </Button>
          </div>
          <p className="mt-7 text-xs font-bold text-white/50">
            Land stays with the community.
            <br />
            Evidence lives on-chain.
          </p>
        </div>
      </section>

      <footer className="bg-accent-600 px-5 py-14 text-white/70">
        <div className="mx-auto grid max-w-[1280px] gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:px-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-lg font-extrabold tracking-[-.06em] text-white">
              <span className="grid size-7 place-items-center rounded-lg bg-primary-700">
                <Trees size={16} aria-hidden="true" />
              </span>
              EcoRimbawa
            </div>
            <p className="mt-3 text-sm">
              Infrastructure for verifiable indigenous forest conservation.
            </p>
          </div>
          <FooterColumn
            title="PLATFORM"
            links={[
              ["Explorer", "#explorer"],
              ["Territories", "#explorer"],
              ["How It Works", "#how-it-works"],
              ["Technology", "#technology"],
            ]}
          />
          <FooterColumn
            title="RESOURCES"
            links={[
              ["Documentation", "#"],
              ["Smart Contracts", "#"],
              ["Methodology", "#dmrv"],
              ["GitHub", "#"],
            ]}
          />
          <FooterColumn
            title="ECOSYSTEM"
            links={[
              ["Arbitrum", "#why-arbitrum"],
              ["dMRV", "#dmrv"],
              ["ReFi", "#economics"],
            ]}
          />
        </div>
        <div className="mx-auto mt-12 max-w-[1280px] border-t border-white/10 pt-6 text-xs text-white/50">
          <p>© 2026 EcoRimbawa</p>
          <p className="mt-1">Built for forests. Built for communities.</p>
        </div>
      </footer>
    </main>
  );
}
