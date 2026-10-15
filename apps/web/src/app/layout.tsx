import type { Metadata, Viewport } from "next";
import "@fontsource-variable/sora";
import "@fontsource-variable/geist";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealObserver } from "@/components/motion/motion";

export const metadata: Metadata = {
  metadataBase: new URL("https://epixo.app"),
  title: { default: "Epixo — LVGL UI editor for real hardware", template: "%s · Epixo" },
  description: "Design LVGL screens in your browser on a canvas that runs LVGL itself. 113 boards, verified C, MicroPython, XML and ESPHome export, and a community of makers.",
  openGraph: { siteName: "Epixo", type: "website", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
  icons: { icon: [{ url: "/favicon.ico", sizes: "48x48" }, { url: "/brand/epixo-icon-192.png", type: "image/png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#F6F7F9", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('html-m')" }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <RevealObserver />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
