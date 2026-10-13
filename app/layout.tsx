import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SITE } from "@/data/site";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: `${SITE.fullName}, Baner`,
  description:
    "Samspire is India's first mushroom café. Farm-fresh mushrooms from our Pawna farm, cooked into nutritious, delicious food in Baner, Pune.",
  openGraph: {
    title: SITE.fullName,
    description: "India's first mushroom café. Farm-fresh, nutritious, delightfully delicious. Baner & Pawna, Pune.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0a1430" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
