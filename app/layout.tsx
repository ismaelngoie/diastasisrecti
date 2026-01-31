"use client";

import "./globals.css";
import React from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

const SITE_NAME = "DiastaFix";
const SITE_URL = "https://diastafix.com"; // ✅ update if you use a different canonical domain
const OG_IMAGE = "/og.png"; // optional: add /public/og.png for best sharing previews

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1A1A26",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Diastasis Recti Repair Plan`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Diastasis recti assessment + abdominal separation repair plan. Track your finger gap, midline tension, and follow safe, low-pressure core progressions for postpartum recovery.",
  keywords: [
    "diastasis recti",
    "diastasis recti repair",
    "abdominal separation",
    "abdominal repair",
    "abdominal reparation",
    "postpartum core rehab",
    "core stability",
    "transverse abdominis",
    "pelvic floor and core",
    "linea alba",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Diastasis Recti Repair Plan`,
    description:
      "Diastasis recti assessment + abdominal separation repair plan. Track your finger gap and follow safe, low-pressure core progressions.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Diastasis Recti Repair`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Diastasis Recti Repair Plan`,
    description:
      "Diastasis recti assessment + abdominal separation repair plan. Track your finger gap and follow safe, low-pressure core progressions.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ✅ Minimal, safe schema that helps Google understand brand/site
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} h-full`}>
      <head>
        {/* Small perf boost for third-party scripts */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />

        {/* ✅ Google tag (gtag.js) - Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17883612588"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17883612588');
            `,
          }}
        />

        {/* ✅ Microsoft Clarity */}
        <Script
          id="clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "v9s9ullom");
            `,
          }}
        />

        {/* ✅ JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

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
