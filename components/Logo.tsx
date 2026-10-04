import Image from "next/image";
import Link from "next/link";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <Link
      href="/"
      className={`flex h-11 items-center gap-2 rounded-sm text-lg font-extrabold tracking-[-0.06em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] ${
        variant === "light" ? "text-white" : "text-[#163D2A]"
      }`}
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
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-[.08em] ${
          variant === "light"
            ? "bg-white/15 text-white"
            : "bg-[#DDEEE3] text-[#246B45]"
        }`}
      >
        AI
      </span>
    </Link>
  );
}
