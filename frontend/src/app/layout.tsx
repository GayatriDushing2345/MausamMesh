import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

import { PwaManager } from "@/components/PwaManager";

export const metadata: Metadata = {
  title: "MausamMesh (मौसममेश) — Panchayat Weather Intelligence",
  description: "MausamMesh downscales IMD block-level forecasts to panchayat resolution for precision agricultural weather intelligence services.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoDevanagari.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0E7C86" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('sih_theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  var scale = localStorage.getItem('mausammesh_text_scale');
                  if (scale && scale !== 'normal') {
                    document.documentElement.setAttribute('data-text-scale', scale);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F6F3EC] dark:bg-[#061321] text-[#0B1F33] dark:text-slate-100 font-sans antialiased selection:bg-monsoon-700 selection:text-white">
        <PwaManager />
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Quiet Footer Attribution */}
        <footer className="bg-white dark:bg-[#0B1F33] border-t border-slate-200/80 dark:border-slate-800/80 py-3.5 px-4 text-center text-xs text-[#5B6472] dark:text-[#B8C4D6]">
          <div className="max-w-[2200px] mx-auto px-[clamp(16px,2.5vw,40px)] flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-monsoon-700 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                IMD
              </div>
              <span className="font-bold text-[#0B1F33] dark:text-slate-100">MausamMesh (मौसममेश)</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Panchayat Agromet Control Room</span>
            </div>
            <div className="text-[#5B6472] dark:text-[#B8C4D6] text-xs">
              Prototype for IMD / MoES agrometeorological services. Not an official IMD product.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
