import core from "@/data/core.json";

export type Board = (typeof core.boards)[number];
export const BOARDS: Board[] = core.boards;
export const VERIFY = core.verify as Record<string, { label: string; note: string }>;
export const TEMPLATES = core.templates;
export const WIDGETS = core.widgets;

export const findBoard = (id: string) => BOARDS.find(b => b.id === id) ?? null;

export const BRANDS = Array.from(new Set(BOARDS.map(b => b.brand))).map(name => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  count: BOARDS.filter(b => b.brand === name).length,
}));

export const verifiedCount = BOARDS.filter(b => b.v !== "spec").length;

export function packName(b: Board) {
  if (!b.pack) return null;
  return b.pack.startsWith("espanel") ? "ESP32_Display_Panel" : "esp32-smartdisplay";
}

export function timeAgo(t: number) {
  const s = Math.max(1, Math.floor(Date.now() / 1000) - t);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return new Date(t * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const SOCIAL = [
  ["YouTube", "https://youtube.com/@NextBuilderIO"],
  ["GitHub", "https://github.com/NextBuilder"],
  ["Instagram", "https://instagram.com/next_builder"],
  ["X", "https://x.com/NEXTBUILDERIO"],
  ["Hackster", "https://hackster.io/NEXTBUILDER"],
  ["Instructables", "https://www.instructables.com/member/Next%20Builder%20DIY/"],
  ["LinkedIn", "https://www.linkedin.com/company/nextbuilderio/"],
] as const;
