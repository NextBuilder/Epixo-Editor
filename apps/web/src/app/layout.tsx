import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealObserver } from "@/components/motion/motion";

export const metadata: Metadata = {
  metadataBase: new URL("https://epixo.app"),
  title: { default: "Epixo · Design screens for ESP32 displays", template: "%s · Epixo" },
  description: "Design LVGL screens on a canvas that runs LVGL itself. 113 boards, verified exports, AI that builds with you, and a community of makers.",
  openGraph: { siteName: "Epixo", type: "website", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
  icons: { icon: [{ url: "/favicon.ico", sizes: "48x48" }, { url: "/brand/epixo-icon-192.png", type: "image/png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F5F5F7" }, { media: "(prefers-color-scheme: dark)", color: "#000000" }],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint: the appearance the maker chose (shared with the editor) and the motion flag.
const boot = "try{var t=localStorage.getItem('epixo.theme');if(t=='light'||t=='dark')document.documentElement.dataset.theme=t}catch(e){}document.documentElement.classList.add('html-m')";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <RevealObserver />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
