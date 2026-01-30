import "./globals.css";
import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fix Diastasis — Medical-Grade Assessment",
  description: "AI-driven protocol to close Diastasis Recti gaps of 2+ fingers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      {/* body NEVER scrolls */}
      <body className="h-screen overflow-hidden bg-[color:var(--navy)] text-white">
        {/* this is the ONLY scroller */}
        <div className="h-screen overflow-y-auto no-scrollbar">
          {children}
        </div>
      </body>
    </html>
  );
}
