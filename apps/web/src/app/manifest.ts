import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Epixo Editor",
    short_name: "Epixo",
    description: "Design LVGL screens on LVGL itself.",
    start_url: "/editor/",
    display: "standalone",
    background_color: "#F6F7F9",
    theme_color: "#F6F7F9",
    icons: [
      { src: "/brand/epixo-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/epixo-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
