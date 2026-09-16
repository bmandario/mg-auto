import type { Metadata } from "next";
import { Raleway, Bebas_Neue } from "next/font/google";
import "./globals.css";

// Heading font — Raleway for specs, labels, body
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Display font — Bebas Neue, the iconic automotive condensed font
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MG Auto | Quality Pre-Owned Cars Philippines",
  description:
    "Browse quality pre-owned cars for sale in the Philippines. Fully inspected, roadworthy certified vehicles with complete service history.",
  keywords: "used cars philippines, pre-owned cars, quality cars for sale, MG Auto",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${raleway.variable} ${bebasNeue.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#0a0a0a]">
        {children}
      </body>
    </html>
  );
}
