import Image from "next/image";
import { Logo } from "@/components/Logo";

const IMAGE_URL =
  "https://images.unsplash.com/photo-1758184633310-accf92429ae4?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// Shared between /login and /create-account — same photo, same gradient,
// only the copy changes per page. Hidden below lg since there's no room for
// a decorative half-screen image once the form needs the full width.
export function AuthImagePanel({
  eyebrow,
  heading,
  body,
}: {
  eyebrow: string;
  heading: string;
  body: string;
}) {
  return (
    <div className="relative hidden w-1/2 lg:block">
      <Image
        src={IMAGE_URL}
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#163D2A]/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#163D2A]/95 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-10">
        <Logo variant="light" />
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#D9A441]">
            {eyebrow}
          </p>
          <h2 className="mt-4 max-w-md text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white">
            {heading}
          </h2>
          <p className="mt-4 max-w-sm text-base leading-7 text-[#c8d7cc]">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
