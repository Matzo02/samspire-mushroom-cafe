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

// Turn on the scroll-driven 3D hero before first paint (so the layout doesn't jump),
// but only if WebGL works and the visitor hasn't asked for reduced motion.
// `?motion` in the URL forces it on for demos.
const MOTION_CHECK = `try{if(/[?&]motion/.test(location.search)||!matchMedia("(prefers-reduced-motion: reduce)").matches){var g=document.createElement("canvas").getContext("webgl2");if(g){document.documentElement.classList.add("motion");var x=g.getExtension("WEBGL_lose_context");x&&x.loseContext()}}}catch(e){}`;

export const viewport: Viewport = { themeColor: "#070d22" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // the inline script adds `.motion` before first paint, so React must accept the changed class
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: MOTION_CHECK }} />
        {children}
      </body>
    </html>
  );
}
