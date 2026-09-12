import type { Metadata } from "next";
import { Raleway, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Heading font — matches "SPECIFICATIONS", "DRIVE TOGETHER" from reference
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Display/hero font — matches "POWERFULL", massive condensed text
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MG Auto | Quality Pre-Owned Cars Philippines",
  description:
    "Browse quality pre-owned cars for sale in the Philippines. Fully inspected, roadworthy certified vehicles with complete service history.",
  keywords: "used cars philippines, pre-owned cars, quality cars for sale, MG Auto",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${raleway.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f5f5f5]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
