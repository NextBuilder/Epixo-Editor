export type ProjectMeta = { name: string; boardId: string | null; boardLabel: string; brand: string; w: number; h: number; round: boolean; screens: number; remixOf: string | null };

export const MAX_PROJECT_BYTES = 600_000;

export function readProject(text: string): ProjectMeta | null {
  if (!text || text.length > MAX_PROJECT_BYTES) return null;
  let p: unknown;
  try {
    p = JSON.parse(text);
  } catch {
    return null;
  }
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, any>;
  if (!o.board || typeof o.board !== "object" || !Array.isArray(o.screens) || !o.screens.length || o.screens.length > 60) return null;
  const w = Number(o.board.w), h = Number(o.board.h);
  if (!(w > 0 && h > 0 && w <= 4096 && h <= 4096)) return null;
  if (o.screens.some((s: any) => !s || !Array.isArray(s.widgets) || s.widgets.length > 400)) return null;
  return {
    name: String(o.name || "Untitled UI").slice(0, 80),
    boardId: o.board.id ? String(o.board.id).slice(0, 80) : null,
    boardLabel: `${String(o.board.brand || "").slice(0, 40)} ${String(o.board.name || "").slice(0, 60)}`.trim(),
    brand: String(o.board.brand || "Custom").slice(0, 40),
    w, h,
    round: !!o.board.round,
    screens: o.screens.length,
    remixOf: typeof o.remixOf === "string" ? o.remixOf.slice(0, 20) : null,
  };
}

export function cleanTags(s: string) {
  return Array.from(new Set(s.toLowerCase().split(/[,\s#]+/).map(t => t.replace(/[^a-z0-9-]/g, "").slice(0, 20)).filter(Boolean))).slice(0, 6).join(",");
}
