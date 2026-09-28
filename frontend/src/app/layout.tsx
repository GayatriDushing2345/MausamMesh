import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MausamMesh (मौसममेश) — Panchayat Weather Intelligence",
  description: "MausamMesh downscales IMD block-level forecasts to panchayat resolution for precision agricultural weather intelligence services.",
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#1A202C] font-sans antialiased">
        <div className="flex-1">
          {children}
        </div>
        <footer className="bg-white border-t border-slate-200/80 py-5 px-4 text-center text-xs mt-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-800">MausamMesh (मौसममेश)</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium">Panchayat Weather Intelligence</span>
            </div>
            <div className="text-slate-500 text-xs">
              IMD &amp; MoES Agrometeorological Service Prototype
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
