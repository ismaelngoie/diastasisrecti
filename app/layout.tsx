import "./globals.css";
import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", 
  themeColor: "#1A1A26",
};

export const metadata: Metadata = {
  title: "Fix Diastasis — Medical-Grade Assessment",
  description: "AI-driven protocol to close Diastasis Recti gaps of 2+ fingers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      {/* 1. BODY IS LOCKED (No Scroll) */}
      <body className="bg-[color:var(--navy)] text-white fixed inset-0 overflow-hidden">
        
        {/* 2. OUTER FRAME (Fills screen exactly) */}
        <div className="w-full h-[100dvh] flex flex-col relative">
          
          {/* 3. INNER SCROLL (The "Moving" Part) 
              This div handles all scrolling. It sits inside the fixed body.
              - overflow-y-auto: Enables scrolling
              - no-scrollbar: Hides the bar visually
          */}
          <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar">
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}
