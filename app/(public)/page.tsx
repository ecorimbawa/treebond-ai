// @/app/page.tsx
"use client";

import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Blocks,
  Check,
  ChevronDown,
  ClipboardList,
  Cpu,
  Gauge,
  Handshake,
  Landmark,
  MapPin,
  Menu,
  RefreshCw,
  Route,
  ShieldCheck,
  Sprout,
  Users,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

const mono = "font-[family-name:var(--font-geist-mono)]";

const statusStyles = {
  healthy: "bg-[#DDEEE3] text-[#246B45]",
  monitoring: "bg-[#FBEFD9] text-[#B7791F]",
  risk: "bg-[#F7E1DE] text-[#B3402F]",
} as const;

function Logo() {
  return (
    <a
      href="#top"
      className="flex h-11 items-center gap-2 rounded-sm text-lg font-extrabold tracking-[-0.06em] text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
      aria-label="TreeBond AI home"
    >
      <Image
        src="/Gemini_Generated_Image_d2an70d2an70d2an-removebg-preview.png"
        alt="TreeBond AI logo"
        width={44}
        height={44}
        priority
        className="h-11 w-11"
      />
      TreeBond
      <span className="rounded-full bg-[#DDEEE3] px-2 py-0.5 text-[10px] font-extrabold tracking-[.08em] text-[#246B45]">
        AI
      </span>
    </a>
  );
}
function Button({
  children,
  secondary = false,
  href = "#",
  className = "",
}: {
  children: ReactNode;
  secondary?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] ${secondary ? "border border-[#d9e2da] bg-white text-[#163D2A] hover:border-[#246B45]" : "bg-[#246B45] text-white hover:bg-[#163D2A]"} ${className}`}
    >
      {children}
      <ArrowRight
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
      <p className="mb-4 text-xs font-extrabold tracking-[0.16em] text-[#B7791F]">
        {eyebrow}
      </p>
      <h2 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-[#18201B] sm:text-5xl">
        {title}
      </h2>
      {children && (
        <div className="mt-5 text-pretty text-base leading-7 text-[#667069] sm:text-lg">
          {children}
        </div>
      )}
    </div>
  );
}
function DataRow({
  label,
  value,
  mono: isMono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#667069]">{label}</dt>
      <dd
        className={`${isMono ? mono : ""} shrink-0 text-right font-semibold ${accent ? "text-[#246B45]" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
function StatusPill({
  status,
  label,
}: {
  status: keyof typeof statusStyles;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusStyles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label.toUpperCase()}
    </span>
  );
}
function TreePassportCard() {
  return (
    <article className="w-full">
      <Image
        src="/Gemini_Generated_Image_o5gebno5gebno5ge-removebg-preview.png"
        alt="Tree RWA #192"
        width={500}
        height={500}
        priority
        className="w-full h-auto"
      />
    </article>
  );
}
function TreePassportDetail() {
  return (
    <article className="w-full rounded-2xl border border-white/20 bg-white p-5 text-[#18201B] shadow-[0_20px_50px_rgba(22,61,42,.1)] sm:p-7">
      <p className={`${mono} text-xs text-[#929A94]`}>TREE-JTG-000192</p>
      <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.05em]">
        🌳 Sengon
      </h3>
      <p className="text-sm text-[#667069]">Central Java</p>

      <div className="my-5 border-t border-[#e2e7e2]" />
      <p className="text-xs font-extrabold tracking-[.12em] text-[#667069]">
        PHYSICAL
      </p>
      <dl className="mt-3 grid gap-2 text-sm">
        <DataRow label="Age" value="8 months" />
        <DataRow label="Height" value="1.82 m" />
        <DataRow label="Status" value="Healthy" accent />
      </dl>

      <div className="my-5 border-t border-[#e2e7e2]" />
      <p className="text-xs font-extrabold tracking-[.12em] text-[#667069]">
        AI ANALYSIS
      </p>
      <dl className="mt-3 grid gap-2 text-sm">
        <DataRow label="Health" value="94/100" />
        <DataRow label="Growth" value="87/100" />
        <DataRow label="Anomaly Risk" value="4%" />
      </dl>

      <div className="my-5 border-t border-[#e2e7e2]" />
      <p className="text-xs font-extrabold tracking-[.12em] text-[#667069]">
        VERIFICATION
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
        {[
          "Initial planting",
          "GPS",
          "Photo",
          "AI analysis",
          "Human verifier",
          "On-chain",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check size={14} className="text-[#246B45]" aria-hidden="true" />{" "}
            {item}
          </li>
        ))}
      </ul>

      <div className="my-5 border-t border-[#e2e7e2]" />
      <p className="text-xs font-extrabold tracking-[.12em] text-[#667069]">
        BLOCKCHAIN
      </p>
      <dl className="mt-3 grid gap-2 text-sm">
        <DataRow label="Network" value="Arbitrum Sepolia" />
        <DataRow label="Token ID" value="192" mono />
        <DataRow label="Owner" value="0x71...92A" mono />
      </dl>

      <div className="mt-6 grid gap-2">
        <a
          href="/trees/192"
          className="flex min-h-11 items-center justify-between rounded-xl bg-[#163D2A] px-4 text-sm font-bold text-white transition hover:bg-[#246B45]"
        >
          View Full Tree Passport <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <a
          href="/trees/192#evidence"
          className="flex min-h-11 items-center justify-between rounded-xl border border-[#d9e2da] px-4 text-sm font-bold text-[#163D2A] transition hover:border-[#246B45]"
        >
          View IPFS Evidence <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
function FlowItem({
  label,
  title,
  sub,
  icon,
  blue = false,
}: {
  label: string;
  title: string;
  sub: string;
  icon: ReactNode;
  blue?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl p-4">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${blue ? "bg-[#e7ebfc] text-[#3154D5]" : "bg-[#DDEEE3] text-[#246B45]"}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-[10px] font-extrabold tracking-[.14em] text-[#929A94]">
          {label}
        </p>
        <p className="mt-1 font-extrabold">{title}</p>
        <p className="mt-1 text-sm text-[#667069]">{sub}</p>
      </div>
    </div>
  );
}
function TreeCard({
  id,
  species,
  location,
  status,
  statusLabel,
  health,
  verifications,
  price,
}: {
  id: string;
  species: string;
  location: string;
  status: keyof typeof statusStyles;
  statusLabel: string;
  health: string;
  verifications: number;
  price: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white transition hover:-translate-y-0.5 hover:border-[#9ec6aa]">
      <div className="grid h-40 place-items-center bg-[#F3F5F1]">
        <Sprout size={32} className="text-[#9ec6aa]" aria-hidden="true" />
      </div>
      <div className="p-5">
        <p className={`${mono} text-xs text-[#929A94]`}>{id}</p>
        <h3 className="mt-1 text-lg font-extrabold">{species}</h3>
        <p className="text-sm text-[#667069]">{location}</p>
        <div className="mt-3">
          <StatusPill status={status} label={statusLabel} />
        </div>
        <dl className="mt-4 grid gap-2 text-sm">
          <DataRow label="Health" value={health} />
          <DataRow label="Verification" value={String(verifications)} />
        </dl>
        <div className="my-4 border-t border-[#e2e7e2]" />
        <div className="flex items-center justify-between">
          <p className="font-extrabold">{price}</p>
          <a
            href={`/trees/${id}`}
            className="inline-flex items-center gap-1 rounded-sm text-sm font-bold text-[#246B45] transition hover:text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
          >
            View Tree <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="text-xs font-extrabold tracking-[.14em] text-[#91a999]">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="rounded-sm text-sm transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441]"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const process = [
  [
    Sprout,
    "01",
    "Register",
    "Plant the record, not just the tree.",
    "Field operators register each tree with species, GPS coordinates, and an initial photo — creating a permanent identity before anything is claimed.",
    "TREE-JTG-000192 registered",
  ],
  [
    BadgeCheck,
    "02",
    "Verify",
    "Confirm what AI sees before anything counts.",
    "AI analyzes every submitted photo for tree detection, health, and growth signals. A human verifier reviews the result before it goes anywhere near the blockchain.",
    "AI confidence 98% · Verifier approved",
  ],
  [
    Blocks,
    "03",
    "Tokenize",
    "Put the verified tree on-chain.",
    "Only verified trees can be minted. Once approved, the tree becomes a traceable Tree RWA — an ERC-721 token on Arbitrum Sepolia.",
    "Token #192 minted",
  ],
  [
    RefreshCw,
    "04",
    "Monitor",
    "Keep proving it, not just once.",
    "Every monitoring cycle adds a new evidence record — new photo, new AI analysis, new verification — so a tree's status is never more than one cycle out of date.",
    "5 verification records",
  ],
] as const;
const timeline = [
  [MapPin, "Tree Registered", "Wonosobo, Central Java"],
  [Sprout, "Sengon Planted", "01 Sep 2026"],
  [Check, "Initial Photo Verified", "GPS matched"],
  [ClipboardList, "Growth Monitoring Logged", "5 records"],
  [Cpu, "AI Health Check", "Score 94/100"],
  [Blocks, "Tree RWA Minted", "Arbitrum Sepolia"],
] as const;
const faqs = [
  [
    "What exactly does a Tree RWA represent?",
    "A Tree RWA is a digital record of a verified, physical tree — its species, location, planting date, and ongoing monitoring history. It represents verified sponsorship and provenance, not legal ownership of the land the tree stands on.",
  ],
  [
    "How is a tree verified before it's tokenized?",
    "Every tree starts with field evidence — a photo, GPS coordinates, and metadata. AI analyzes that evidence for tree detection, health, and growth signals, and a human verifier reviews the AI result before approving it. Only approved verifications are ever submitted on-chain.",
  ],
  [
    "What happens if AI detects an anomaly?",
    "An anomaly flag doesn't reject a tree automatically — it routes the evidence to a verifier for closer review. Anomalies can mean anything from early disease signs to a simple lighting issue in the photo, so a human always makes the final call.",
  ],
  [
    "Is TreeBond AI a carbon credit platform?",
    "No. TreeBond AI's current scope is tree registration, monitoring, and verified sponsorship only. Any future carbon impact figures will be clearly labeled as estimates until they go through an independent certification process — TreeBond never represents a Tree RWA as a certified carbon credit.",
  ],
  [
    "Why Arbitrum Sepolia and not mainnet?",
    "Arbitrum Sepolia lets TreeBond AI run real verification and minting flows at testnet cost while the contracts, monitoring pipeline, and legal model are still being hardened. Mainnet deployment comes after audit, access-control review, and legal review — not before.",
  ],
  [
    "Can I track a tree after I sponsor it?",
    "Yes. Every sponsored tree appears in your dashboard with its full monitoring history, and you'll see new evidence and verification records as soon as they're submitted and approved.",
  ],
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  const nav = [
    ["How It Works", "#how-it-works"],
    ["Tree Explorer", "#explore-preview"],
    ["Ecosystem", "#ecosystem"],
    ["Technology", "#technology"],
    ["FAQ", "#faq"],
  ];
  return (
    <main id="top" className="overflow-x-clip bg-[#FAFAF7] text-[#18201B]">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "bg-white/90 backdrop-blur" : "bg-[#FAFAF7]/80"}`}
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
                className="inline-flex h-11 items-center rounded-sm text-sm font-bold text-[#667069] transition hover:text-[#246B45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden md:block">
            <Button href="/explore" className="min-h-10 px-4">
              Explore Trees
            </Button>
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg text-[#163D2A] focus-visible:outline-2 md:hidden"
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
            className="border-t border-[#e2e7e2] bg-white px-5 py-4 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto grid max-w-[1280px] gap-1">
              {nav.map(([label, href]) => (
                <a
                  onClick={() => setMenuOpen(false)}
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-3 text-sm font-bold hover:bg-[#F3F5F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
                >
                  {label}
                </a>
              ))}
              <Button href="/explore" className="mt-2">
                Explore Trees
              </Button>
              <Button secondary href="/operator/projects" className="mt-2">
                Register Project
              </Button>
            </div>
          </nav>
        )}
      </header>
      <section className="relative mx-auto grid max-w-[1280px] gap-12 px-5 pb-24 pt-36 sm:pt-44 lg:grid-cols-12 lg:items-center lg:px-8 lg:pb-36">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe2d4] bg-[#eff7f1] px-3 py-1.5 text-xs font-bold text-[#246B45]">
            <Blocks size={14} aria-hidden="true" /> Arbitrum Sepolia Testnet
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-5xl font-extrabold leading-[.98] tracking-[-.065em] text-[#163D2A] sm:text-6xl lg:text-7xl">
            Making Living Assets Verifiable On-Chain.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-[#667069]">
            TreeBond AI turns real trees into continuously monitored,
            independently verified digital assets — connecting sponsors, field
            operators, and verifiers around one living record of proof.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/explore">Explore Trees</Button>
            <Button secondary href="/operator/projects">
              Register Project
            </Button>
          </div>
          <p className="mt-9 text-xs font-bold tracking-wide text-[#667069]">
            Field Evidence <span className="mx-2 text-[#B7791F]">·</span> AI
            Verification <span className="mx-2 text-[#B7791F]">·</span> On-chain
            Proof
          </p>
        </div>
        <div className="relative lg:col-span-5">
          <div className="absolute -inset-8 -z-10 rounded-full bg-[#DDEEE3] blur-3xl" />
          <TreePassportCard />
        </div>
      </section>
      <section
        id="problem"
        className="border-y border-[#e2e7e2] bg-white py-24 sm:py-32"
      >
        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <SectionIntro
              eyebrow="THE PROBLEM"
              title={
                <>
                  Living assets are real.
                  <br />
                  Proof of their condition is not.
                </>
              }
            >
              A single tree can stand for years between the moment it&apos;s
              planted and the moment someone actually checks on it. In that gap,
              a photo can be reused, a location can be faked, and a growth claim
              can go completely unchecked — until the person who sponsored it
              has no way to know if the tree is even still alive.
            </SectionIntro>
            <p className="mt-8 border-l-4 border-[#D9A441] pl-5 text-lg font-extrabold leading-7 text-[#163D2A]">
              Blockchain can&apos;t verify a tree by itself. TreeBond AI
              connects it to the real world first.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="rounded-2xl bg-[#F3F5F1] p-6 sm:p-8">
              <p className="text-xs font-extrabold tracking-[.14em] text-[#667069]">
                WHAT SPONSORS CURRENTLY CAN&apos;T VERIFY
              </p>
              <div className="mt-6 space-y-1">
                {[
                  [
                    "Existence",
                    "Is the tree actually planted where it's claimed to be?",
                  ],
                  ["Condition", "Is it healthy, growing, or already dead?"],
                  [
                    "History",
                    "Has anyone actually checked on it since planting?",
                  ],
                  [
                    "Ownership",
                    "Whose record decides any of this — and can it be changed quietly?",
                  ],
                ].map(([item, desc], index) => (
                  <div key={item} className="relative flex gap-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-xs font-extrabold text-[#246B45]">
                      0{index + 1}
                    </span>
                    <div className="pb-5">
                      <p className="font-bold">{item}</p>
                      <p className="mt-1 text-sm text-[#667069]">{desc}</p>
                    </div>
                    {index < 3 && (
                      <span className="absolute left-[18px] top-9 h-[calc(100%-36px)] border-l border-dashed border-[#a8b4aa]" />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm font-extrabold text-[#667069]">
                Four questions.{" "}
                <span className="text-[#163D2A]">
                  Zero independent answers — until now.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        id="how-it-works"
        className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8"
      >
        <SectionIntro
          eyebrow="FROM SEEDLING TO ON-CHAIN PROOF"
          title="One tree. One continuously verified journey."
          centered
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {process.map(([Icon, number, label, title, text, data]) => (
            <article
              key={number}
              className="group rounded-2xl border border-[#e2e7e2] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#9ec6aa]"
            >
              <div className="flex items-start justify-between">
                {number === "01" ? (
                  <Image
                    src="/Gemini_Generated_Image_27s70u27s70u27s7-removebg-preview.png"
                    alt={title}
                    width={44}
                    height={44}
                    className="size-11"
                  />
                ) : number === "02" ? (
                  <Image
                    src="/Gemini_Generated_Image_536jxa536jxa536j-removebg-preview.png"
                    alt={title}
                    width={44}
                    height={44}
                    className="size-11"
                  />
                ) : (
                  <span className="grid size-11 place-items-center rounded-xl bg-[#DDEEE3] text-[#246B45]">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                )}
                <span className={`${mono} text-xs text-[#929A94]`}>
                  {number}
                </span>
              </div>
              <p className="mt-6 text-xs font-extrabold tracking-[.14em] text-[#B7791F]">
                {label}
              </p>
              <h3 className="mt-2 text-xl font-extrabold tracking-[-.04em]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#667069]">{text}</p>
              <p className={`${mono} mt-5 text-xs leading-5 text-[#246B45]`}>
                {data}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section id="why-blockchain" className="bg-[#F3F5F1] py-24 sm:py-36">
        <div className="mx-auto grid max-w-[1280px] items-start gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionIntro
              eyebrow="WHY BLOCKCHAIN"
              title="Not proof of life. Proof the record wasn't changed."
            >
              TreeBond AI doesn&apos;t ask you to trust a blockchain to know a
              tree is alive — it asks field evidence, AI, and human verifiers to
              establish that first. What the blockchain guarantees is narrower
              and more honest: once a verification is recorded, nobody —
              including TreeBond — can quietly edit it.
            </SectionIntro>
            <ul className="mt-8 grid gap-3 text-sm font-semibold text-[#163D2A]">
              {[
                "Immutable ownership record",
                "Transparent verification history",
                "Auditable evidence trail (CID + hash)",
                "Programmable settlement",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check
                    size={16}
                    className="shrink-0 text-[#246B45]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-6 sm:p-8">
            <p className="text-xs font-extrabold tracking-[.14em] text-[#667069]">
              BEFORE vs AFTER
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-[#F3F5F1] p-4">
                <p className="text-xs font-extrabold tracking-[.1em] text-[#929A94]">
                  WITHOUT TREEBOND
                </p>
                <p className="mt-2 text-sm leading-6 text-[#667069]">
                  A screenshot of a photo. A number in someone&apos;s
                  spreadsheet. Trust required.
                </p>
              </div>
              <div className="rounded-xl bg-[#F3F5F1] p-4 ring-1 ring-[#9ec6aa]">
                <p className="text-xs font-extrabold tracking-[.1em] text-[#246B45]">
                  WITH TREEBOND
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#163D2A]">
                  Hash-anchored evidence. Verifier-approved record. Trust
                  optional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="ai-verification"
        className="border-y border-[#e2e7e2] bg-white py-24 sm:py-36"
      >
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <SectionIntro
                eyebrow="AI VERIFICATION"
                title="AI reads the photo. A human still signs off."
              >
                Every monitoring photo runs through TreeBond&apos;s AI pipeline
                before a verifier ever sees it — flagging tree detection
                confidence, health score, growth score, and anomaly risk
                automatically, so verifiers spend their time reviewing, not
                guessing.
              </SectionIntro>
              <p className="mt-8 rounded-xl bg-[#F3F5F1] p-4 text-sm font-semibold leading-6 text-[#163D2A]">
                AI assists verification. It never has sole authority to approve
                a tree on-chain — every result is reviewed by a human verifier
                first.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="rounded-2xl border border-[#e2e7e2] bg-white p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold tracking-[.12em] text-[#667069]">
                    AI ANALYSIS · TREE-JTG-000192
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDEEE3] px-2.5 py-1 text-[10px] font-extrabold text-[#246B45]">
                    Healthy
                  </span>
                </div>
                <dl className="mt-6 grid gap-3 text-sm">
                  <DataRow label="Health Score" value="94 / 100" accent />
                  <DataRow label="Growth Score" value="87 / 100" />
                  <DataRow label="Anomaly Risk" value="4%" />
                </dl>
                <div className="my-5 border-t border-[#e2e7e2]" />
                <p className="text-sm leading-6 text-[#667069]">
                  The submitted image is visually consistent with previous
                  evidence. No major health anomaly was detected.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#e2e7e2] bg-[#FAFAF7] px-6 py-7 sm:px-8">
            <span className="text-sm font-bold text-[#667069]">Photo</span>
            <ArrowRight
              size={16}
              className="text-[#929A94]"
              aria-hidden="true"
            />
            <span className="inline-flex items-center gap-2 rounded-full bg-[#DDEEE3] px-3 py-1.5 text-xs font-extrabold text-[#246B45]">
              <Cpu size={14} aria-hidden="true" /> AI Analysis
            </span>
            <ArrowRight
              size={16}
              className="text-[#929A94]"
              aria-hidden="true"
            />
            <span className="inline-flex items-center gap-2 rounded-full bg-[#DDEEE3] px-3 py-1.5 text-xs font-extrabold text-[#246B45]">
              <Gauge size={14} aria-hidden="true" /> Health · Growth · Anomaly
            </span>
            <ArrowRight
              size={16}
              className="text-[#929A94]"
              aria-hidden="true"
            />
            <span className="inline-flex items-center gap-2 rounded-full bg-[#DDEEE3] px-3 py-1.5 text-xs font-extrabold text-[#246B45]">
              <Users size={14} aria-hidden="true" /> Human Verification
            </span>
            <ArrowRight
              size={16}
              className="text-[#929A94]"
              aria-hidden="true"
            />
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e7ebfc] px-3 py-1.5 text-xs font-extrabold text-[#3154D5]">
              <Blocks size={14} aria-hidden="true" /> On-chain Record
            </span>
          </div>
        </div>
      </section>
      <section id="rwa" className="bg-[#F3F5F1] py-24 sm:py-36">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <SectionIntro
            eyebrow="REAL-WORLD ASSETS"
            title={
              <>
                Physical tree.
                <br />
                Digital representation.
              </>
            }
          >
            A Tree RWA connects something that exists in the physical world — a
            verified, GPS-located, continuously monitored tree — with a digital
            record that can be tracked, held, and checked by anyone, at any
            time.
            <p className="mt-6 border-l-4 border-[#246B45] pl-4 font-bold text-[#163D2A]">
              1 Tree RWA = a verified sponsorship record for 1 real, monitored
              tree.
            </p>
            <p className="mt-5 text-sm leading-6 text-[#929A94]">
              The exact rights a token carries depend on the project and its
              sponsorship terms. TreeBond AI represents verified sponsorship and
              monitoring history — not legal ownership of land.
            </p>
          </SectionIntro>
          <div className="rounded-2xl border border-[#e2e7e2] bg-white p-5 sm:p-7">
            <FlowItem
              label="PHYSICAL WORLD"
              title="1 Sengon Tree · Central Java"
              sub="Planted 01 Sep 2026 · TREE-JTG-000192"
              icon={<Sprout size={19} aria-hidden="true" />}
            />
            <div className="mx-auto h-9 w-px bg-[#D9A441]" />
            <FlowItem
              label="VERIFICATION"
              title="Health · Growth · Location confirmed"
              sub="Reviewed by an independent verifier"
              icon={<BadgeCheck size={19} aria-hidden="true" />}
            />
            <div className="mx-auto h-9 w-px bg-[#3154D5]" />
            <FlowItem
              label="BLOCKCHAIN"
              title="TREE RWA #192"
              sub="1 token · Arbitrum Sepolia"
              icon={<Blocks size={19} aria-hidden="true" />}
              blue
            />
          </div>
        </div>
      </section>
      <section
        id="explore-preview"
        className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8"
      >
        <SectionIntro
          eyebrow="EXPLORE TREES"
          title="A few trees, already being watched."
          centered
        >
          Every tree below has its own identity, GPS location, and verification
          history — and every one of them is one photo away from its next
          update.
        </SectionIntro>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TreeCard
            id="TREE-JTG-000192"
            species="Sengon"
            location="Central Java"
            status="healthy"
            statusLabel="Healthy"
            health="94/100"
            verifications={5}
            price="Rp100.000"
          />
          <TreeCard
            id="TREE-JTG-000205"
            species="Mahogany"
            location="East Java"
            status="healthy"
            statusLabel="Healthy"
            health="89/100"
            verifications={3}
            price="Rp150.000"
          />
          <TreeCard
            id="TREE-JTG-000241"
            species="Teak"
            location="Central Java"
            status="monitoring"
            statusLabel="Monitoring"
            health="76/100"
            verifications={2}
            price="Rp120.000"
          />
        </div>
        <div className="mt-10 text-center">
          <Button secondary href="/explore">
            View All Trees
          </Button>
        </div>
      </section>
      <section
        id="provenance"
        className="border-y border-[#e2e7e2] bg-white py-24 sm:py-36"
      >
        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 lg:grid-cols-12 lg:items-center lg:px-8">
          <div className="lg:col-span-5">
            <SectionIntro
              eyebrow="PROVENANCE"
              title="Know the story behind every tree."
            >
              TreeBond links every Tree RWA back to its full monitoring history
              — so anyone holding or checking one can trace it from the day it
              was planted to its most recent verification.
            </SectionIntro>
            <Button secondary href="/trees/192#history" className="mt-8">
              View Monitoring History
            </Button>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ol className="rounded-2xl border border-[#e2e7e2] bg-white p-6 sm:p-8">
              {timeline.map(([Icon, title, detail], i) => (
                <li key={title} className="relative flex gap-4 pb-7 last:pb-0">
                  <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-[#DDEEE3] text-[#246B45]">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  {i < timeline.length - 1 && (
                    <span className="absolute left-5 top-10 h-[calc(100%-20px)] border-l border-dashed border-[#bfd0c2]" />
                  )}
                  <div className="pt-1">
                    <p className="font-extrabold">{title}</p>
                    <p className="mt-1 text-sm text-[#667069]">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section id="passport" className="bg-[#163D2A] py-24 sm:py-36">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 lg:grid-cols-12 lg:items-center lg:px-8">
          <div className="lg:col-span-6">
            <p className="mb-4 text-xs font-extrabold tracking-[.16em] text-[#D9A441]">
              TREE PASSPORT
            </p>
            <h2 className="max-w-xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-.055em] text-white sm:text-5xl">
              Every tree has a story. Every story has proof.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-7 text-[#c8d7cc]">
              Each TreeBond RWA carries a digital passport linking its physical
              identity, AI analysis, verification history, and on-chain record —
              in one place, open to anyone who wants to check it.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <TreePassportDetail />
          </div>
        </div>
      </section>
      <section
        id="ecosystem"
        className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8"
      >
        <SectionIntro
          eyebrow="ECOSYSTEM"
          title="Built for everyone behind the tree."
          centered
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              Handshake,
              "Sponsors",
              "Sponsor a real tree, track its growth, and hold a digital record you can actually check — not just a certificate you have to trust.",
            ],
            [
              ClipboardList,
              "Operators",
              "Register projects and trees, upload monitoring evidence, and build a verifiable history for every hectare you manage.",
            ],
            [
              BadgeCheck,
              "Verifiers",
              "Review AI analysis against field evidence and approve or reject verification before anything reaches the blockchain.",
            ],
            [
              Landmark,
              "Admins",
              "Oversee projects, operators, and verifiers, and step in when a dispute needs a human decision.",
            ],
          ].map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof Handshake;
            return (
              <article
                key={title as string}
                className="rounded-2xl border border-[#e2e7e2] bg-white p-6"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-[#DDEEE3] text-[#246B45]">
                  <IconComponent size={21} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold">
                  {title as string}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#667069]">
                  {text as string}
                </p>
              </article>
            );
          })}
        </div>
      </section>
      <section
        id="technology"
        className="border-y border-[#e2e7e2] bg-white py-24 sm:py-36"
      >
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="INFRASTRUCTURE"
            title="Built for transparent, living assets."
            centered
          />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              [
                Route,
                "Traceable",
                "Every evidence upload and verification on a Tree RWA is recorded on-chain and open to independent inspection — not locked in a private database.",
              ],
              [
                ShieldCheck,
                "Verifiable",
                "No tree is tokenized without first passing through AI analysis and human verification. Claims are checked before they're recorded, not after.",
              ],
              [
                Gauge,
                "Efficient",
                "TreeBond AI runs on Arbitrum, keeping on-chain verification fast and inexpensive enough for frequent, real monitoring cycles — not just one-time minting.",
              ],
            ].map(([Icon, title, text]) => {
              const IconComponent = Icon as typeof Route;
              return (
                <article
                  key={title as string}
                  className="rounded-2xl border border-[#e2e7e2] p-6"
                >
                  <IconComponent
                    className="text-[#246B45]"
                    size={25}
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 text-xl font-extrabold">
                    {title as string}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#667069]">
                    {text as string}
                  </p>
                </article>
              );
            })}
          </div>
          <p className="mt-10 text-center text-sm font-bold text-[#3154D5]">
            <Blocks size={15} className="mr-2 inline" aria-hidden="true" />
            Powered by Arbitrum Sepolia Testnet
          </p>
        </div>
      </section>
      <section id="faq" className="bg-[#F3F5F1] py-24 sm:py-36">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="FAQ"
            title="Questions worth answering before you connect a wallet."
            centered
          />
          <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-[#e2e7e2] bg-white p-6 sm:p-8">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group border-b border-[#e2e7e2] py-5 first:pt-0 last:border-b-0 last:pb-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-[#18201B] [&::-webkit-details-marker]:hidden">
                  {question}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-[#667069] transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-sm leading-6 text-[#667069]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section
        id="launch"
        className="bg-[#163D2A] px-5 py-24 text-center sm:py-32"
      >
        <p className="text-sm font-extrabold tracking-[.16em] text-[#D9A441]">
          TREEBOND AI
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-balance text-4xl font-extrabold tracking-[-.055em] text-white sm:text-5xl">
          Make a Living Asset Verifiable Today.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-[#c8d7cc]">
          Explore a verified tree, or register your reforestation project and
          start building a monitoring record that actually holds up to scrutiny.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/explore">Explore Trees</Button>
          <Button secondary href="/operator/projects">
            Register Project
          </Button>
        </div>
        <p className="mt-7 text-xs font-bold text-[#b5c9ba]">
          <Blocks size={13} className="mr-1 inline" aria-hidden="true" /> Built
          on Arbitrum Sepolia Testnet
        </p>
      </section>
      <footer className="bg-[#122e20] px-5 py-14 text-[#c8d7cc]">
        <div className="mx-auto grid max-w-[1280px] gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:px-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Image
                src="/Gemini_Generated_Image_d2an70d2an70d2an-removebg-preview.png"
                alt="TreeBond AI"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-extrabold tracking-[-.06em] text-white">TreeBond AI</span>
            </div>
            <p className="mt-3 text-sm">Verified Trees. On-chain Proof.</p>
          </div>
          <FooterColumn
            title="PRODUCT"
            links={[
              ["Tree Explorer", "/explore"],
              ["How It Works", "#how-it-works"],
              ["Tree Passport", "#passport"],
              ["Register Project", "/operator/projects"],
            ]}
          />
          <FooterColumn
            title="RESOURCES"
            links={[
              ["Documentation", "/docs"],
              ["FAQ", "#faq"],
              ["Smart Contracts", "/docs/contracts"],
              ["Verification Process", "#ai-verification"],
            ]}
          />
          <FooterColumn
            title="NETWORK"
            links={[
              ["Arbitrum Sepolia", "#top"],
              ["Block Explorer", "#top"],
            ]}
          />
          <FooterColumn
            title="LEGAL"
            links={[
              ["Terms", "/legal/terms"],
              ["Privacy", "/legal/privacy"],
              ["RWA Disclosure", "/legal/rwa-disclosure"],
            ]}
          />
        </div>
        <div className="mx-auto mt-12 max-w-[1280px] border-t border-white/10 pt-6 text-xs text-[#91a999]">
          © 2026 TreeBond AI
        </div>
      </footer>
    </main>
  );
}
