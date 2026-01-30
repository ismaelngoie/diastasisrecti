import "./globals.css";
import type { Metadata, Viewport } from "next"; // Added Viewport type
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

// 1. Force the mobile browser to respect the notch area
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // <--- Puts color behind the Dynamic Island
  themeColor: "#1A1A26", // <--- Matches your Navy bg
};

export const metadata: Metadata = {
  title: "Fix Diastasis — Medical-Grade Assessment",
  description: "AI-driven protocol to close Diastasis Recti gaps of 2+ fingers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="bg-[color:var(--navy)] text-white min-h-screen flex flex-col">
        
        {/* MAIN APP CONTAINER (Matches Pelvi Logic) */}
        {/* - w-full: Full width on mobile
            - h-[100dvh]: Dynamic Height (fixes Safari address bar jumping)
            - md:max-w-md: On desktop, we limit width to look like a phone (since this is a vertical app)
            - md:mx-auto: Centers it on desktop
            - md:shadow-2xl: Adds depth on desktop
        */}
        <div className="w-full h-[100dvh] flex flex-col mx-auto relative md:max-w-md md:h-screen md:max-h-[900px] md:my-auto md:rounded-[40px] md:overflow-hidden md:border-[8px] md:border-white/10 md:shadow-2xl">
          {children}
        </div>
        
      </body>
    </html>
  );
}
