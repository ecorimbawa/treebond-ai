// @/app/page.tsx
"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Blocks,
  Check,
  ClipboardList,
  Gauge,
  Handshake,
  MapPin,
  Menu,
  PackageCheck,
  RefreshCw,
  Route,
  ShieldCheck,
  Sprout,
  Warehouse,
  Wheat,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

const mono = "font-[family-name:var(--font-geist-mono)]";
function Logo() {
  return (
    <a
      href="#top"
      className="flex h-11 items-center gap-2 rounded-sm text-lg font-extrabold tracking-[-0.06em] text-[#163D2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45]"
      aria-label="Agriva home"
    >
      <span className="grid size-7 place-items-center rounded-lg bg-[#246B45] text-white">
        <Sprout size={16} aria-hidden="true" />
      </span>
      AGRIVA
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
function PassportCard({ dark = false }: { dark?: boolean }) {
  return (
    <article
      className={`w-full rounded-2xl border p-5 shadow-[0_20px_50px_rgba(22,61,42,.1)] sm:p-7 ${dark ? "border-white/20 bg-white text-[#18201B]" : "border-[#e2e7e2] bg-white text-[#18201B]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold tracking-[0.12em] text-[#667069]">
          HARVEST RWA #102
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDEEE3] px-2.5 py-1 text-[10px] font-extrabold text-[#246B45]">
          <BadgeCheck size={13} aria-hidden="true" /> VERIFIED
        </span>
      </div>
      <h3 className="mt-6 text-3xl font-extrabold tracking-[-0.05em]">
        Padi IR64
      </h3>
      <div className="mt-6 rounded-xl bg-[#F3F5F1] p-4">
        <p className="text-xs font-semibold text-[#667069]">
          Verified Quantity
        </p>
        <p className="mt-1 text-3xl font-extrabold tracking-[-0.05em]">
          4,850 <span className="text-base">kg</span>
        </p>
      </div>
      <div className="my-5 border-t border-[#e2e7e2]" />
      <dl className="grid gap-3 text-sm">
        <DataRow label="Batch" value="#PKT-004" mono />
        <DataRow label="Harvest" value="24 Sep 2026" />
        <DataRow label="Farmer" value="0x71A...82F" mono />
        <DataRow label="Verifier" value="0x42B...991" mono />
        <DataRow label="Farming Proof" value="Available ↗" accent />
      </dl>
      <div className="my-5 border-t border-[#e2e7e2]" />
      <dl className="grid gap-3 text-sm">
        <DataRow label="Network" value="Arbitrum One" />
        <DataRow label="Contract" value="0x92F...110" mono />
        <DataRow label="Token Supply" value="4,850" mono />
      </dl>
      <a
        href="#rwa"
        className="mt-6 flex min-h-11 items-center justify-between rounded-xl bg-[#163D2A] px-4 text-sm font-bold text-white transition hover:bg-[#246B45]"
      >
        View RWA Passport <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </article>
  );
}
const process = [
  [
    Sprout,
    "01",
    "Document",
    "Record the farming process.",
    "Farmers document their farm, crops, seeds, fertilizers, treatments, and farming activities.",
    "Farm → Crop → Treatment",
  ],
  [
    Wheat,
    "02",
    "Harvest",
    "Record the physical harvest.",
    "Create a harvest batch containing commodity, harvest date, quantity, and supporting farming records.",
    "Padi IR64 · 5,000 kg",
  ],
  [
    BadgeCheck,
    "03",
    "Verify",
    "Verify what actually exists.",
    "Authorized cooperatives, warehouses, or verifiers inspect the physical harvest before tokenization.",
    "Claimed      5,000 kg\nVerified     4,850 kg ✓",
  ],
  [
    Blocks,
    "04",
    "Tokenize",
    "Bring verified harvests on-chain.",
    "Once verified, the harvest can be represented as a traceable Real-World Asset on Arbitrum.",
    "4,850 kg → Harvest RWA",
  ],
] as const;
const timeline = [
  [MapPin, "Farm Registered", "Klaten, Central Java"],
  [Sprout, "Padi IR64 Planted", "12 Jun 2026"],
  [ClipboardList, "Farming Activities", "18 records"],
  [Wheat, "Harvest Recorded", "24 Sep 2026"],
  [BadgeCheck, "Harvest Verified", "4,850 kg"],
  [Blocks, "RWA Created", "Arbitrum One"],
] as const;
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
function Inventory({
  label,
  physical,
  supply,
}: {
  label: string;
  physical: string;
  supply: string;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold tracking-[.13em] text-[#B7791F]">
        {label}
      </p>
      <div className="mt-4 grid gap-3 text-sm">
        <DataRow label="Physical Inventory" value={physical} />
        <DataRow label="Token Supply" value={supply} mono />
      </div>
    </div>
  );
}
function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-xs font-extrabold tracking-[.14em] text-[#91a999]">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#top"
              className="rounded-sm text-sm transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441]"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    ["For Farmers", "#ecosystem"],
    ["RWA", "#rwa"],
    ["Technology", "#technology"],
  ];
  return (
    <main id="top" className="overflow-x-clip bg-[#FAFAF7] text-[#18201B]">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "border-b border-[#e2e7e2] bg-white/90 backdrop-blur" : "bg-[#FAFAF7]/80"}`}
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
            <Button href="#launch" className="min-h-10 px-4">
              Launch App
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
              <Button href="#launch" className="mt-2">
                Launch App
              </Button>
            </div>
          </nav>
        )}
      </header>
      <section className="relative mx-auto grid max-w-[1280px] gap-12 px-5 pb-24 pt-36 sm:pt-44 lg:grid-cols-12 lg:items-center lg:px-8 lg:pb-36">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe2d4] bg-[#eff7f1] px-3 py-1.5 text-xs font-bold text-[#246B45]">
            <Blocks size={14} aria-hidden="true" /> Built on Arbitrum
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-5xl font-extrabold leading-[.98] tracking-[-.065em] text-[#163D2A] sm:text-6xl lg:text-7xl">
            Turn Every Harvest Into a Verifiable Asset.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-[#667069]">
            Agriva connects real farming records, verified harvests, and
            blockchain to create traceable agricultural Real-World Assets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#launch">Start Farming</Button>
            <Button secondary href="#rwa">
              Explore RWA
            </Button>
          </div>
          <p className="mt-9 text-xs font-bold tracking-wide text-[#667069]">
            Farm Records <span className="mx-2 text-[#B7791F]">·</span> Verified
            Harvests <span className="mx-2 text-[#B7791F]">·</span> On-chain
            Traceability
          </p>
        </div>
        <div className="relative lg:col-span-5">
          <div className="absolute -inset-8 -z-10 rounded-full bg-[#DDEEE3] blur-3xl" />
          <PassportCard />
        </div>
      </section>
      <section className="border-y border-[#e2e7e2] bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <SectionIntro
              eyebrow="THE PROBLEM"
              title={
                <>
                  Agricultural assets are real.
                  <br />
                  Their records are often fragmented.
                </>
              }
            >
              A harvest can pass through farmers, cooperatives, warehouses,
              distributors, and buyers. Along the way, information about where
              it came from, how it was produced, and how much actually exists
              can become fragmented.
            </SectionIntro>
            <p className="mt-8 border-l-4 border-[#D9A441] pl-5 text-lg font-extrabold leading-7 text-[#163D2A]">
              Blockchain can&apos;t verify a harvest by itself. Agriva connects
              it to the real world.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="rounded-2xl bg-[#F3F5F1] p-6 sm:p-8">
              <p className="text-xs font-extrabold tracking-[.14em] text-[#667069]">
                THE PHYSICAL JOURNEY
              </p>
              <div className="mt-6 space-y-1">
                {[
                  "Farmer",
                  "Cooperative",
                  "Warehouse",
                  "Distributor",
                  "Buyer",
                ].map((item, index) => (
                  <div key={item} className="relative flex items-center gap-4">
                    <span className="grid size-9 place-items-center rounded-full bg-white text-xs font-extrabold text-[#246B45]">
                      0{index + 1}
                    </span>
                    <p className="font-bold">{item}</p>
                    {index < 4 && (
                      <span className="absolute left-[18px] top-9 h-5 border-l border-dashed border-[#a8b4aa]" />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm font-bold text-[#667069]">
                Different actors. Different records.{" "}
                <span className="text-[#163D2A]">One physical asset.</span>
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
          eyebrow="FROM FARM TO ON-CHAIN"
          title="One harvest. One verifiable journey."
          centered
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {process.map(([Icon, number, label, title, text, data]) => (
            <article
              key={number}
              className="group rounded-2xl border border-[#e2e7e2] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#9ec6aa]"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-[#DDEEE3] text-[#246B45]">
                  <Icon size={21} aria-hidden="true" />
                </span>
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
              <div
                className={`${mono} mt-5 space-y-0.5 text-xs leading-5 text-[#246B45]`}
              >
                {data.split("\n").map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="rwa" className="bg-[#F3F5F1] py-24 sm:py-36">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <SectionIntro
            eyebrow="REAL-WORLD ASSETS"
            title={
              <>
                Physical harvest.
                <br />
                Digital representation.
              </>
            }
          >
            A Real-World Asset connects something that exists in the physical
            world with a digital representation on blockchain.
            <p className="mt-6 border-l-4 border-[#246B45] pl-4 font-bold text-[#163D2A]">
              1 unit = claim against 1 kg of commodity from its verified batch
            </p>
            <p className="mt-5 text-sm leading-6 text-[#929A94]">
              The exact rights represented by each token depend on the asset and
              redemption structure.
            </p>
          </SectionIntro>
          <div className="rounded-2xl border border-[#e2e7e2] bg-white p-5 sm:p-7">
            <FlowItem
              label="PHYSICAL WORLD"
              title="4,850 kg · Padi IR64"
              sub="Verified Harvest · Batch #PKT-004"
              icon={<Wheat size={19} aria-hidden="true" />}
            />
            <div className="mx-auto h-9 w-px bg-[#D9A441]" />
            <FlowItem
              label="VERIFICATION"
              title="Quantity · Commodity · Batch"
              sub="Provenance confirmed"
              icon={<BadgeCheck size={19} aria-hidden="true" />}
            />
            <div className="mx-auto h-9 w-px bg-[#3154D5]" />
            <FlowItem
              label="BLOCKCHAIN"
              title="HARVEST RWA #102"
              sub="4,850 units · Arbitrum One"
              icon={<Blocks size={19} aria-hidden="true" />}
              blue
            />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1280px] gap-14 px-5 py-24 sm:py-36 lg:grid-cols-12 lg:items-center lg:px-8">
        <div className="lg:col-span-5">
          <SectionIntro
            eyebrow="PROVENANCE"
            title="Know the story behind every harvest."
          >
            Agriva connects the tokenized asset with the farming records behind
            it, creating a traceable history from cultivation to harvest.
          </SectionIntro>
          <Button secondary href="#passport" className="mt-8">
            View Farming Proof
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
      </section>
      <section id="passport" className="bg-[#163D2A] py-24 sm:py-36">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 lg:grid-cols-12 lg:items-center lg:px-8">
          <div className="lg:col-span-6">
            <p className="mb-4 text-xs font-extrabold tracking-[.16em] text-[#D9A441]">
              RWA PASSPORT
            </p>
            <h2 className="max-w-xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-.055em] text-white sm:text-5xl">
              Every asset has a story. Every story has proof.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-7 text-[#c8d7cc]">
              Each Agriva RWA includes a digital passport connecting the
              physical harvest, verification record, farming provenance, and
              on-chain activity.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <PassportCard dark />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8">
        <SectionIntro
          eyebrow="PHYSICAL SETTLEMENT"
          title="From token back to harvest."
          centered
        >
          When an RWA supports redemption, tokens can be redeemed against the
          underlying commodity according to the batch&apos;s redemption terms.
        </SectionIntro>
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#e2e7e2] bg-white p-6 sm:p-8">
            <div className="grid gap-3 text-center sm:grid-cols-4 sm:items-center">
              {[
                ["500 RWA", "Units"],
                ["REDEEM", ""],
                ["500", "Units Burned"],
                ["500 kg", "Released"],
              ].map(([top, bottom], i) => (
                <div key={top} className="relative rounded-xl bg-[#F3F5F1] p-4">
                  <p
                    className={`font-extrabold ${i === 1 ? "text-[#B7791F]" : "text-[#163D2A]"}`}
                  >
                    {top}
                  </p>
                  <p className="mt-1 text-xs text-[#667069]">{bottom}</p>
                  {i < 3 && (
                    <ArrowRight
                      className="absolute -right-6 top-1/2 hidden -translate-y-1/2 text-[#B7791F] sm:block"
                      size={18}
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-7 flex items-center justify-center gap-2 text-sm font-bold text-[#667069]">
              <RefreshCw
                size={16}
                className="text-[#246B45]"
                aria-hidden="true"
              />{" "}
              Redeem through approved custodian terms
            </div>
          </div>
          <div className="rounded-2xl bg-[#F3F5F1] p-6 sm:p-8">
            <Inventory label="BEFORE" physical="4,850 kg" supply="4,850" />
            <div className="my-6 border-t border-[#d9e2da]" />
            <Inventory
              label="AFTER 500 KG REDEMPTION"
              physical="4,350 kg"
              supply="4,350"
            />
            <p className="mt-7 text-sm font-extrabold text-[#246B45]">
              <Check size={16} className="mr-2 inline" aria-hidden="true" />
              Physical inventory and token supply stay synchronized.
            </p>
          </div>
        </div>
      </section>
      <section
        id="technology"
        className="border-y border-[#e2e7e2] bg-white py-24 sm:py-36"
      >
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionIntro
            eyebrow="INFRASTRUCTURE"
            title="Built for transparent agricultural assets."
            centered
          />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              [
                Route,
                "Traceable",
                "Asset activity can be independently inspected through blockchain records.",
              ],
              [
                Gauge,
                "Efficient",
                "Agriva uses Arbitrum infrastructure for low-cost on-chain transactions.",
              ],
              [
                ShieldCheck,
                "Verifiable",
                "Every tokenized harvest originates from an approved verification process.",
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
            Powered by Arbitrum One
          </p>
        </div>
      </section>
      <section
        id="ecosystem"
        className="mx-auto max-w-[1280px] px-5 py-24 sm:py-36 lg:px-8"
      >
        <SectionIntro
          eyebrow="ECOSYSTEM"
          title="Built for everyone behind the harvest."
          centered
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              Sprout,
              "Farmers",
              "Document farming activities and create harvest records.",
            ],
            [
              Handshake,
              "Cooperatives",
              "Help verify harvests and coordinate farmers.",
            ],
            [
              Warehouse,
              "Warehouses",
              "Maintain verified physical inventory and custody.",
            ],
            [
              PackageCheck,
              "Buyers",
              "Inspect provenance and verification information before interacting with an asset.",
            ],
          ].map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof Sprout;
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
        id="launch"
        className="bg-[#163D2A] px-5 py-24 text-center sm:py-32"
      >
        <p className="text-sm font-extrabold tracking-[.16em] text-[#D9A441]">
          AGRIVA
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-balance text-4xl font-extrabold tracking-[-.055em] text-white sm:text-5xl">
          Bring Real Harvests On-Chain.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-[#c8d7cc]">
          Start documenting your farm today and build the verifiable history
          behind tomorrow&apos;s agricultural assets.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="#top">Launch Agriva</Button>
          <Button secondary href="#rwa">
            Explore Harvest RWA
          </Button>
        </div>
        <p className="mt-7 text-xs font-bold text-[#b5c9ba]">
          <Blocks size={13} className="mr-1 inline" aria-hidden="true" /> Built
          on Arbitrum One
        </p>
      </section>
      <footer className="bg-[#122e20] px-5 py-14 text-[#c8d7cc]">
        <div className="mx-auto grid max-w-[1280px] gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:px-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-lg font-extrabold tracking-[-.06em] text-white">
              <span className="grid size-7 place-items-center rounded-lg bg-[#246B45]">
                <Sprout size={16} aria-hidden="true" />
              </span>{" "}
              AGRIVA
            </div>
            <p className="mt-3 text-sm">Verified Harvests. On-chain Assets.</p>
          </div>
          <FooterColumn
            title="PRODUCT"
            links={["Farm", "Harvest", "RWA", "RWA Passport"]}
          />
          <FooterColumn
            title="RESOURCES"
            links={["Documentation", "How It Works", "Smart Contracts", "FAQ"]}
          />
          <FooterColumn
            title="NETWORK"
            links={["Arbitrum One", "Block Explorer"]}
          />
          <FooterColumn
            title="LEGAL"
            links={["Terms", "Privacy", "RWA Disclosure"]}
          />
        </div>
        <div className="mx-auto mt-12 max-w-[1280px] border-t border-white/10 pt-6 text-xs text-[#91a999]">
          © 2026 Agriva
        </div>
      </footer>
    </main>
  );
}
