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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} h-full`}>
      <body className="bg-[color:var(--navy)] text-white fixed inset-0 h-full overflow-hidden">
        <div className="w-full h-dvh flex flex-col min-h-0">
          <div
            className="
              flex-1 min-h-0 w-full
              overflow-y-auto overscroll-contain
              [-webkit-overflow-scrolling:touch]
              no-scrollbar
              pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
              pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]
            "
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
