import type { Metadata } from "next";
import { DM_Sans, Great_Vibes, Playfair_Display } from "next/font/google";
import PageTransition from "@/components/ui/PageTransition";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaleej — A Modern Coastal Kitchen",
  description:
    "Discover our unique flavours. Coastal ingredients, time-honoured recipes and a dining experience made for good company.",
  keywords: ["restaurant", "kaleej", "coastal kitchen", "order online", "kozhikode"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${greatVibes.variable}`}>
      <body className="min-h-screen">
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
