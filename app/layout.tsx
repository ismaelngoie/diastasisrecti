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

// 1. VIEWPORT CONFIG (Critical for Mobile)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents accidental zooming on inputs
  viewportFit: "cover", // Tells the phone to use the space behind the Notch/Island
  themeColor: "#1A1A26", // Matches your navy background
};

export const metadata: Metadata = {
  title: "Fix Diastasis — Medical-Grade Assessment",
  description: "AI-driven protocol to close Diastasis Recti gaps of 2+ fingers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      {/* BODY: Fixed inset-0 ensures it never moves. 
        The background color lives here.
      */}
      <body className="bg-[color:var(--navy)] text-white fixed inset-0 overflow-hidden">
        
        {/* APP SHELL: 
          - h-[100dvh]: Fills exactly the visible screen (minus address bar).
          - w-full: Full width.
          - flex-col: Stacks your app vertically.
          - relative: Positions children correctly.
        */}
        <div className="w-full h-[100dvh] flex flex-col relative">
          
          {/* INNER CONTENT:
            This is where your OnboardingWrapper lives. 
            We do NOT add overflow-y-auto here because your OnboardingWrapper 
            already handles its own scrolling internally.
          */}
          <main className="flex-1 w-full h-full relative">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
