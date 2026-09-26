import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoRimbawa — Verifiable Indigenous Forest Conservation",
  description:
    "EcoRimbawa connects indigenous territory documentation, forest monitoring, decentralized verification, and blockchain to create transparent and economically sustainable conservation.",
  keywords: [
    "Indigenous Forest Conservation",
    "Tanah Adat",
    "dMRV",
    "ReFi",
    "RWA",
    "Carbon Credit",
    "Forest Monitoring",
    "Arbitrum",
    "Blockchain Conservation",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
